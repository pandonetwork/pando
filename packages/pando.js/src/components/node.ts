import Repository from '@components/repository'
import Pando from '@pando'
import * as utils from '@utils'
import CID from 'cids'
// import IPFS from 'ipfs'
import IPFS from 'ipfs'
import IPFS_API from 'ipfs-api'
import IPFSRepo from 'ipfs-repo'
import memoryLock from 'ipfs-repo/src/lock-memory'
import IPLD from 'ipld'
import IPLDPando from 'ipld-pando'
import npath from 'path'
import promisify from 'promisify-event'
import util from 'util'
import DAG from 'ipld-dag-cbor'

import wrtc from 'wrtc' // or require('electron-webrtc')()
import WStar from 'libp2p-webrtc-star'

const wstar = new WStar({ wrtc: wrtc })

/* tslint:disable:object-literal-sort-keys */
const IPFSRepoOpts = {
  storageBackends: {
    root: require('datastore-fs'),
    blocks: require('datastore-fs'),
    keys: require('datastore-fs'),
    datastore: require('datastore-fs')
  },
  storageBackendOptions: {
    root: {
      extension: '.ipfsroot', // Defaults to ''. Used by datastore-fs; Appended to all files
      errorIfExists: false, // Used by datastore-fs; If the datastore exists, don't throw an error
      createIfMissing: true // Used by datastore-fs; If the datastore doesn't exist yet, create it
    },
    blocks: {
      sharding: false, // Used by IPFSRepo Blockstore to determine sharding; Ignored by datastore-fs
      extension: '.ipfsblock', // Defaults to '.data'.
      errorIfExists: false,
      createIfMissing: true
    },
    keys: {
      extension: '.ipfskey', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    },
    datastore: {
      extension: '.ipfsds', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    }
  },
  lock: memoryLock
}
/* tslint:enable:object-literal-sort-keys */

export default class Node {
  public static async create(repository: Repository): Promise<Node> {
    const IPFSRepository = new IPFSRepo(repository.paths.ipfs, IPFSRepoOpts)
    // const ipfs = new IPFS({
    // repo: IPFSRepository,
    // start: false,
    // EXPERIMENTAL: {
    //   pubsub: true, // enable pubsub
    //   relay: {
    //     enabled: true, // enable relay dialer/listener (STOP)
    //     hop: {
    //       enabled: true // make this node a relay (HOP)
    //     }
    //   }
    // },
    // config: {
    //   Addresses: {
    //     Swarm: ['/ip4/0.0.0.0/tcp/4002', '/ip4/127.0.0.1/tcp/4003/ws'],
    //     API: '/ip4/127.0.0.1/tcp/5002',
    //     Gateway: '/ip4/127.0.0.1/tcp/9090'
    //   },
    //   Discovery: {
    //     MDNS: {
    //       Enabled: true,
    //       Interval: 10
    //     },
    //     webRTCStar: {
    //       Enabled: true
    //     }
    //   },
    //   Bootstrap: [
    //     '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    //     '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    //     '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    //     '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    //     '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    //     '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    //     '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    //     '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    //     '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    //     '/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    //     '/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    //     '/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    //     '/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    //     '/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    //     '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    //     '/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    //     '/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    //     '/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    //     '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
    //   ]
    //   // Addresses: {
    //   //   Swarm: [
    //   //     '/ip4/0.0.0.0/tcp/4002',
    //   //     '/ip4/127.0.0.1/tcp/4003/ws',
    //   //     '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
    //   //   ],
    //   //   Bootstrap: [
    //   //     '/ip4/25.196.147.100/tcp/4001/ipfs/QmaMqSwWShsPg2RbredZtoneFjXhim7AQkqbLxib45Lx4S'
    //   //   ]
    //   // }
    // }
    // libp2p: {
    //   modules: {
    //     transport: [wstar],
    //     discovery: [wstar.discovery]
    //   }
    // }
    // config: {
    //   Addresses: {
    //     Swarm: [
    //       '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
    //       '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
    //     ]
    //   }
    // }
    // })
    // await promisify(ipfs, 'ready')
    // const ipld = new IPLD(ipfs.block)
    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    // ipld.support.rm('raw')
    // ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)
    const ipfs = IPFS_API('localhost', '5001', { protocol: 'http' })

    const gateway = IPFS_API('localhost', '5001', { protocol: 'http' })

    // const IPLDinMemory = util.promisify(IPLD.inMemory)

    // const ipld = await IPLD.inMemory()
    return new Node(repository, ipfs, gateway)
  }

  public static async load(repository: Repository): Promise<Node> {
    // const IPFSRepository = new IPFSRepo(repository.paths.ipfs, IPFSRepoOpts)
    // const ipfs = new IPFS({
    //   repo: IPFSRepository,
    //   init: false,
    //   start: false,
    //   EXPERIMENTAL: {
    //     pubsub: true, // enable pubsub
    //     relay: {
    //       enabled: true, // enable relay dialer/listener (STOP)
    //       hop: {
    //         enabled: true // make this node a relay (HOP)
    //       }
    //     }
    //   },
    //   config: {
    //     Addresses: {
    //       Swarm: ['/ip4/0.0.0.0/tcp/4002', '/ip4/127.0.0.1/tcp/4003/ws'],
    //       API: '/ip4/127.0.0.1/tcp/5002',
    //       Gateway: '/ip4/127.0.0.1/tcp/9090'
    //     },
    //     Discovery: {
    //       MDNS: {
    //         Enabled: true,
    //         Interval: 10
    //       },
    //       webRTCStar: {
    //         Enabled: true
    //       }
    //     },
    //     Bootstrap: [
    //       '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    //       '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    //       '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    //       '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    //       '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    //       '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    //       '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    //       '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    //       '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    //       '/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    //       '/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    //       '/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    //       '/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    //       '/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    //       '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    //       '/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    //       '/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    //       '/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    //       '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
    //     ]
    //     // Addresses: {
    //     //   Swarm: [
    //     //     '/ip4/0.0.0.0/tcp/4002',
    //     //     '/ip4/127.0.0.1/tcp/4003/ws',
    //     //     '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
    //     //   ],
    //     //   Bootstrap: [
    //     //     '/ip4/25.196.147.100/tcp/4001/ipfs/QmaMqSwWShsPg2RbredZtoneFjXhim7AQkqbLxib45Lx4S'
    //     //   ]
    //     // }
    //   }
    //   // libp2p: {
    //   //   modules: {
    //   //     transport: [wstar],
    //   //     discovery: [wstar.discovery]
    //   //   }
    //   // }
    //   // config: {
    //   //   Addresses: {
    //   //     Swarm: [
    //   //       '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
    //   //       '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
    //   //     ]
    //   //   }
    //   // }
    // })
    // await promisify(ipfs, 'ready')
    // const ipld = new IPLD(ipfs.block)
    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    // ipld.support.rm('raw')
    // ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    // const ipfs = IPFS_API('ipfs.infura.io', '5001', { protocol: 'https' })
    // const gateway = IPFS_API('ipfs.infura.io', '5001', { protocol: 'https' })

    const ipfs = IPFS_API('localhost', '5001', { protocol: 'http' })

    const gateway = IPFS_API('localhost', '5001', { protocol: 'http' })

    return new Node(repository, ipfs, gateway)
  }

  public repository: Repository
  public gateway: any
  public ipfs: any
  public ipld: any

  public constructor(
    repository: Repository,
    ipfs: any,
    gateway: any,
    ipld?: any
  ) {
    this.repository = repository
    this.ipfs = ipfs
    this.ipld = ipld
    this.gateway = gateway
  }

  public async upload(path: string): Promise<string> {
    const results = await this.ipfs.files.add([
      {
        content: utils.fs.read(path),
        path: npath.relative(this.repository.paths.root, path)
      }
    ])
    return results[0].hash
  }

  public async uploadToGateway(cid: string, path: string): Promise<string> {
    const buffer = await this.ipfs.files.cat(cid)
    const results = await this.gateway.files.add([
      {
        content: buffer,
        path: path
      }
    ])
    return results[0].hash
  }

  public async download(cid: any, path?: string) {
    path = path || ''
    cid = CID.isCID(cid) ? cid : new CID(cid)

    const result = await this.ipfs.dag.get(cid, path)
    const node = result.value
    const nodePath = npath.join(this.repository.paths.root, node.path)

    if (node['@type'] === 'tree') {
      if (!utils.fs.exists(nodePath)) {
        utils.fs.mkdir(nodePath)
      }

      delete node['@type']
      delete node.path

      for (const entry in node) {
        if (node.hasOwnProperty(entry)) {
          await this.download(cid, path + '/' + entry)
        }
      }
    } else if (node['@type'] === 'file') {
      const buffer = await this.ipfs.files.cat(
        cid.toBaseEncodedString() + '/' + path + '/link'
      )
      utils.fs.write(nodePath, buffer)
    }

    return
  }

  public async put(object: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.ipfs.dag.put(
        object,
        { format: 'dag-cbor', hashAlg: 'keccak-256' },
        async (err, cid) => {
          if (err) {
            reject(err)
          } else {
            resolve(cid)
          }
        }
      )
    })
  }

  public async get(cid: any, path?: string): Promise<any> {
    // console.log(
    //   '[GET][CID :: ' + cid.toBaseEncodedString() + '][PATH :: ' + path + ']'
    // )
    return new Promise<any>(async (resolve, reject) => {
      cid = CID.isCID(cid) ? cid : new CID(cid)
      this.ipfs.dag.get(cid, path || '', async (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  public async cid(data, opts?: any) {
    if (opts && opts.file) {
      const file = [
        {
          content: utils.fs.read(data),
          path: npath.relative(this.repository.paths.root, data)
        }
      ]
      const results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash
    } else {
      const hash = await this.ipfs.dag.put(data, {
        format: 'dag-cbor',
        hashAlg: 'keccak-256'
      })
      return hash.toBaseEncodedString()
    }
  }
}
