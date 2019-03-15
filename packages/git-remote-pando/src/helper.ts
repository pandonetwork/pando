import debug from 'debug'
import ETHProvider from 'eth-provider'
import fs from 'fs-extra'
import json from 'jsonfile'
import Level from 'level'
import git from 'nodegit'
import ora from 'ora'
import os from 'os'
import path from 'path'
import shell from 'shelljs'
import contractor from 'truffle-contract'
import Web3 from 'web3'
import GitHelper from './util/git-helper'
import IPLDHelper from './util/ipld-helper'
import LineHelper from './util/line-helper'

const _timeout = async (duration: any): Promise<void> => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

export default class Helper {
  public name: string
  public url: string
  public path: string
  public address: string
  public config: any
  public debug: any
  public line: LineHelper
  public git: GitHelper
  public ipld: IPLDHelper

  private _repo!: any
  private _db: any
  private _artifact: any
  private _contract!: any
  private _provider: any
  private _web3: any

  constructor(name: string = '_', url: string) {
    this.name = name
    this.url = url
    this.path = path.resolve(process.env.GIT_DIR as string)
    this.address = this.url.split('://')[1]
    this.config = this._config()
    this.debug = debug('pando')
    this.line = new LineHelper()
    this.git = new GitHelper(this)
    this.ipld = new IPLDHelper()
  }

  public async initialize(): Promise<void> {
    fs.ensureDirSync(path.join(this.path, 'refs', 'remotes', this.name))
    fs.ensureDirSync(path.join(this.path, 'pando', 'refs'))

    this._repo = await git.Repository.open(this.path)
    this._db = Level(path.join(this.path, 'pando', 'refs', this.address))
    this._provider = await this._ethConnect()
    this._web3 = new Web3(this._provider)
    this._artifact = contractor(require('@pando/repository/build/contracts/PandoRepository.json'))
    this._artifact.setProvider(this._provider)
    this._artifact.defaults({
      gas: 30e6,
      gasPrice: 15000000001,
      from: this.config.ethereum.account,
    })
    this._contract = await this._artifact.at(this.address)
  }

  public async run(): Promise<void> {
    while (true) {
      const cmd = await this.line.next()

      switch (this._cmd(cmd)) {
        case 'capabilities':
          await this._handleCapabilities()
          break
        case 'list for-push':
          await this._handleList({ forPush: true })
          break
        case 'list':
          await this._handleList()
          break
        case 'fetch':
          await this._handleFetch(cmd)
          break
        case 'push':
          await this._handlePush(cmd)
          break
        case 'end':
          this._exit()
        case 'unknown':
          this._die('unknown command: ' + cmd)
      }
    }
  }

  /***** command handling methods *****/

  private async _handleCapabilities(): Promise<void> {
    this.debug('capabilities')
    // this._send('option')
    this._send('fetch')
    this._send('push')
    this._send('')
  }

  private async _handleList({ forPush = false }: { forPush?: boolean } = {}): Promise<void> {
    forPush ? this.debug('list', 'for-push') : this.debug('list')
    const refs = await this._fetchRefs()
    for (const ref in refs) {
      this._send(this.ipld.cidToSha(refs[ref]) + ' ' + ref)
    }
    // force HEAD to master and update once pando handle symbolic refs
    this._send('@refs/heads/master' + ' ' + 'HEAD')
    this._send('')
  }

  private async _handleFetch(line: string): Promise<void> {
    this.debug(line)

    while (true) {
      const [cmd, oid, name] = line.split(' ')
      await this._fetch(oid, name)
      line = await this.line.next()

      if (line === '') {
        break
      }
    }

    this._send('')
  }

  private async _handlePush(line: string): Promise<void> {
    this.debug(line)

    while (true) {
      const [src, dst] = line.split(' ')[1].split(':')

      if (src === '') {
        await this._delete(dst)
      } else {
        await this._push(src, dst)
      }

      line = await this.line.next()

      if (line === '') {
        break
      }
    }

    this._send('')
  }

  /**********/

  private async _fetchRefs(): Promise<any> {
    this.debug('fetching refs')

    let start
    let block
    let events
    const ops: object[] = []
    const updates: object = {}

    try {
      start = await this._db.get('@block')
    } catch (err) {
      if (err.message === 'Key not found in database [@block]') {
        start = 0
      } else {
        throw err
      }
    }

    block = await this._web3.eth.getBlockNumber()
    events = await this._contract.getPastEvents('UpdateRef', {
      fromBlock: start,
      toBlock: 'latest',
    })

    for (const event of events) {
      updates[event.args.ref] = event.args.hash
    }

    for (const ref in updates) {
      ops.push({ type: 'put', key: ref, value: updates[ref] })
    }

    ops.push({ type: 'put', key: '@block', value: block })

    await this._db.batch(ops)

    return this._getRefs()
  }

  private async _getRefs(): Promise<object> {
    const refs: any = {}

    return new Promise<object>((resolve, reject) => {
      this._db
        .createReadStream()
        .on('data', ref => {
          if (ref.key !== '@block') {
            refs[ref.key] = ref.value
          }
        })
        .on('error', err => {
          reject(err)
        })
        .on('end', function() {
          //
        })
        .on('close', function() {
          resolve(refs)
        })
    })
  }

  /***** core methods *****/

  private async _fetch(oid: string, ref: string): Promise<void> {
    this.debug('fetching', oid, this.ipld.shaToCid(oid), ref)
    await this.git.download(oid)
  }

  private async _push(src: string, dst: string): Promise<void> {
    this.debug('pushing', src, 'to', dst)

    let spinner
    let head
    let mapping: any = {}
    const ops: any = []

    try {
      const refs = await this._getRefs()
      const remote: any = refs[dst]
      const oid = await git.Reference.nameToId(this._repo, src)
      const revwalk = git.Revwalk.create(this._repo)
      revwalk.pushRef(src)

      const srcBranch = src.split('/').pop()
      const dstBranch = dst.split('/').pop()

      const revListCmd = remote ? `git rev-list --left-only ${srcBranch}...${this.name}/${dstBranch}` : 'git rev-list --all'

      const commits = shell
        .exec(revListCmd, { silent: true })
        .stdout.split('\n')
        .slice(0, -1)

      console.error(commits)

      // collecting git objects
      spinner = ora('collecting git objects').start()
      for (const commit of commits) {
        if (commit !== '') {
          console.error('PUSH LOOP: ' + commit)
          const [_cid, _node, _mapping] = await this.git.collect(commit)
          mapping = { ...mapping, ..._mapping }
        }
      }

      head = this.ipld.shaToCid(commits[0])
      console.error('HEAD')
      console.error(head)
      for (const entry in mapping) {
        ops.push[await this.ipld.put(mapping[entry])]
      }
      spinner.succeed('git objects collected')

      // pushing git objects to IPFS
      spinner = ora('pushing git objects to IPFS').start()
      await Promise.all(ops)
      spinner.succeed('git objects pushed to IPFS')

      spinner = ora(`pushing ref ${dst} on-chain`).start()
      await this._contract.push(dst, head)
      spinner.succeed(`ref ${dst} pushed on-chain`)

      this._send(`ok ${dst}`)
    } catch (err) {
      this._die(err)
    }
  }

  private async _delete(dst: string): Promise<void> {
    this.debug('deleting', dst)
  }

  /***** utility methods *****/

  private async _ethConnect(): Promise<void> {
    const provider = ETHProvider(this.config.ethereum.gateway)
    const message = 'Connecting to Ethereum'
    const spinner = ora(message).start()

    while (true) {
      try {
        const accounts = await provider.send('eth_accounts')
        spinner.stop()
        for (const account of accounts) {
          if (account === this.config.ethereum.account) {
            return provider
          }
        }
        this._die(
          "Your Ethereum gateway does not handle your Ethereum account. Update your gateway configuration or run 'git pando config' to select another account."
        )
      } catch (err) {
        if (err.code === 4100 || err.code === 4001) {
          spinner.text = message + ': ' + err.message
          await _timeout(2000)
        } else {
          spinner.stop()
          this._die('Cannot connect to Ethereum. Make sure your Ethereum gateway is running.')
        }
      }
    }

    return provider
  }

  private _config(): any {
    const LOCAL = path.join(this.path, 'pando', '.pandorc')
    const GLOBAL = path.join(os.homedir(), '.pandorc')

    if (fs.pathExistsSync(LOCAL)) {
      return json.readFileSync(LOCAL)
    }
    if (fs.pathExistsSync(GLOBAL)) {
      return json.readFileSync(GLOBAL)
    }

    this._die("No configuration file found. Run 'git-pando config' and come back to us.")
  }

  private _cmd(line: string): string {
    if (line === 'capabilities') {
      return 'capabilities'
    } else if (line === 'list for-push') {
      return 'list for-push'
    } else if (line === 'list') {
      return 'list'
    } else if (line.startsWith('option')) {
      return 'option'
    } else if (line.startsWith('fetch')) {
      return 'fetch'
    } else if (line.startsWith('push')) {
      return 'push'
    } else if (line === '') {
      return 'end'
    } else {
      return 'unknown'
    }
  }

  private _send(message): void {
    console.log(message)
  }

  private _die(message: string): void {
    console.error(message)
    process.exit(1)
  }

  private _exit(): void {
    process.exit(0)
  }
}
