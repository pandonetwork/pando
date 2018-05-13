import path from 'path'
import fs from 'fs'
import IPFS from 'ipfs'
import IPLD from 'ipld'
import { promisify } from 'util'
import klaw from 'klaw-sync'
import _ from 'lodash'
import cids from 'cids'

import eventify from 'promisify-event'

import Pando from '@pando'
import DAO from '@components/dao'
import Satellizer from '@components/satellizer'
import { IPaths } from '@interfaces'
import * as utils from '@locals/utils'

export default class Repository {
  
  public static paths: IPaths = {
    root: '.',
    pando: '.pando',
    ipfs: '.pando/ipfs',
    conf: '.pando/conf',
    tmp: '.pando/tmp',
    index: '.pando/index',
    head: '.pando/head',
    refs: '.pando/refs'
  }
  
  public pando: Pando
  public paths: IPaths = { ...Repository.paths }
  public dao?: DAO
  
  public ipfs: any
  public ipld: any
  public satellizer: any
  
  public constructor (_pando: Pando, _path: string = '.', opts?: any) {
    this.pando = _pando
    for (let p in Repository.paths) { this.paths[p] = path.join(_path, Repository.paths[p]) }
  }
  
  public static exists (_path: string = '.'): boolean {
    return utils.fs.exists(path.join(_path, Repository.paths['pando']))
  }
  
  public static at (_path: string = '.') {
    
  }
  
  public async initialize (_what: string = 'all'): Promise < void > {
    let configuration = this.pando.configuration

    if (_what === 'all' || _what === 'directory') {
      if(utils.fs.exists(this.paths.conf)) {
        throw new Error('A pando repository already exists in the current working directory')
      }
      await utils.fs.mkdir(this.paths.pando)
      await utils.fs.mkdir(this.paths.tmp)
      await utils.fs.mkdir(this.paths.refs)
      await utils.json.write(this.paths.conf, configuration)
      await utils.json.write(this.paths.index, {})
      await utils.json.write(this.paths.head, 'undefined')
      console.log('DIRECTORY BUILD')
    }
      
    if (_what === 'all' || _what === 'ipfs') {  
      this.ipfs = new IPFS({ repo: this.paths.ipfs })
      eventify(this.ipfs, 'error').catch(err => { throw err })
      await eventify(this.ipfs, 'ready')
      this.satellizer = new Satellizer(this.ipfs)
      await this.ipfs.stop()
      console.log('IPFS IS READY')
    }
    if (_what === 'all' || _what === 'dao') {
      console.log('DOING THE DAO STUFF')
      this.dao = await this.pando.dao.create()
    }
  }
  
  public async loadIPFS (): Promise < void > {
    return new Promise < void > (async (resolve, reject) => {
        
      try {
        this.ipfs = new IPFS({ repo: this.paths.ipfs, init: false })

        this.ipfs.on('ready', async () => {
          this.satellizer = new Satellizer(this.ipfs)
          resolve()
        })
       
        this.ipfs.on('error', async () => {
          reject()
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  
  public async updateIndex (): Promise < any > {
  
    // si le fichier est rajouté je mets undefined à stage et repo
    // si le fichier existe déjà je remplace just le champ wdir
    // si le fichier est supprimé je mets null à wdir
    // et quand je fais un commit je clean la version du dépot
    
    
    let index: any = this.index
    let files: any = {}
    let filter = item => item.path.indexOf('.pando') < 0 
    let _files = klaw(this.paths.root, { nodir: true, filter: filter })
    
    for (let _file in _files) {
      let _path = path.relative(this.paths.root, _files[_file].path)
      let _mtime = _files[_file].stats.mtime
      files[_path] = { mtime: _mtime }
    }
    
    let copy: any = Object.assign(files)
        
    for (let _path in index) {
      if (files[_path]) {
        if (new Date(index[_path].mtime) < new Date(files[_path].mtime)) {
          // File has been modified
          let file = [ { path: _path, content: fs.readFileSync(_path) } ]
          let results = await this.ipfs.files.add(file, { 'only-hash': true })
          let cid = results[0].hash
          index[_path].mtime = files[_path].mtime
          index[_path].wdir = cid          
        } else {
        }
        
      } else {
        // File has been deleted
        index[_path].mtime = Date.now()
        index[_path].wdir = 'null'
      }
      delete copy[_path]
    }
    
    for (let _path in copy) {
      // File has been added
      let file = [ { path: _path, content: fs.readFileSync(path.join(this.paths.root, _path)) } ]
      let results = await this.ipfs.files.add(file, { 'only-hash': true })
      let cid = results[0].hash
      index[_path] = { mtime: files[_path].mtime, wdir: cid, stage: 'null', repo: 'null' }
    }
    
    
    this.index = index
    
    return index
  
  }
  
  public async log(opts?: any): Promise < any > {
    let commits: any[] = []
    let commit = await this.satellizer.get(this.head)
    
    commits.push(commit)
    
    while (typeof commit.parents !== 'undefined') {
      commit = await this.satellizer.get(commit.parents[0]['/'])
      commits.push(commit)
    }
        
    return commits
  }
  
  public async status (): Promise < any > {
    let index: any = {}
    const filter = item => item.path.indexOf('.pando') < 0    
    const files = klaw('.', { nodir: true, filter: filter })
    
    
    for (let _file of files) {
      console.log('FILE')
      let relative = path.relative('.', _file.path)
      console.log(relative)
      let file = [ { path: relative, content: fs.readFileSync(relative) } ]
      let cid = await this.ipfs.files.add(file, { 'only-hash': true })
      console.log(cid)
      index[relative] = { wdir: cid[0].hash, stage: 'null', repo: 'null' }
    }
    
    this.index = index
    
  }
  
  public async add (_paths: string[]): Promise < void > {
    
    let index = await this.updateIndex()
    
    for (let _path of _paths) {
      _path = path.normalize(_path)
      let relativePath = path.relative(this.paths.root, _path)
      let file = [{ path: relativePath, content: fs.readFileSync(_path) }]
      let result = await this.ipfs.files.add(file)
      index[relativePath].stage = result[0].hash
    }
    
    this.index = index
  
  }
  
  public async download (cid: any, _path: string = '.', _name?: string) : Promise < void > {
    
    _path = path.normalize(_path)
    let value = await this.satellizer.get(cid)
    
    if (value.data) { // value is a file
      _name = _name || ''
      utils.fs.write(_name, value.data)
    } else { // value is a tree
      if (_name) {
        utils.fs.mkdir(_name)
      }      
      for (let entry in value) {
        let name = _name ? path.join(_name, entry) : path.join(_path, entry)  
        await this.download(value[entry].link['/'], _path, name)
      }
      
    }
  }
  
  public async commit (_message: string): Promise < any > {
    
    let index: any = this.index
    let stagedPaths: any[] = []
    let parents = this.head === "undefined" ? undefined : [{ '/': this.head }]
    
    for (let _path in index) {
      if (index[_path].repo !== index[_path].stage) {
        stagedPaths.push(_path)
      }
    }
    
    let tree = await this.pushTree(this.tree(stagedPaths))
    
    let commit = {
      '@type': 'commit',
      'timestamp': Date.now(),
      'parents': parents,
      'tree':  { '/' : tree.cid },
      'author': this.pando.configuration.user.account,
      'message': _message
    }  
        
    let cid = await this.satellizer.put(commit)
    
    this.head = cid
    
    return cid
    
  }
  
  public async pushTree (tree: any[]): Promise < any > {
    
    let index: any = this.index
    
    for (let entry of tree) {
      
      if(index[entry.path]) { // entry is a file
        
        index[entry.path].repo = index[entry.path].stage
        
        this.index = index
        
        return { path: entry.path, cid: index[entry.path].stage }
      
      } else { // entry is a tree node
        
        let node = {}

        for (let child of entry.children) {
          let link = await this.pushTree([child])
          node = { ...node, [path.basename(link.path)]: { 'link': { '/': link.cid } } }
        }
        
        let cid = await this.satellizer.put(node)
        
        return { path: entry.path, cid: cid }
      
      }
      
    }
    
  }
  
  public async push (): Promise < any > {
    if(this.dao) {
      let tx = await this.dao.push(this.head)
      return tx
    } else {
      throw new Error('DAO undefined')
    }
    
  }
  
  private tree (paths: string[]): any[] {
    let tree: any[] = []

    for (let _path of paths) {
      _path = path.normalize(_path)
      let parts = _path.split('/')
      let level: any[] = tree

      parts.forEach((part, index) => {
        let existing = _.find(level, (entry: any) => { return entry.path === parts.slice(0, index + 1).join('/') })
        if (existing) {
          level = existing.children
        } else {
          let newLevel = { path: parts.slice(0, index + 1).join('/'), children: [] }
          level.push(newLevel)
          level = newLevel.children
        }
      })
    }
    
    tree = [ { path: '.', children: tree } ]
    
    return tree
  }
  
  public get head (): string {
    return utils.json.read(this.paths['head'])
  }

  public set head (_head: string) {
    utils.json.write(this.paths['head'], _head)
  }
  
  public get index (): string {
    return utils.json.read(this.paths['index'])
  }

  public set index (_index: string) {
    utils.json.write(this.paths['index'], _index)
  }
  
  
}