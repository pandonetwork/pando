import path from 'path'
import fs from 'fs'
import IPFS from 'ipfs'
import IPLD from 'ipld'
import { promisify } from 'util'
import Unixfs from 'ipfs-unixfs'

import klaw from 'klaw-sync'
import _ from 'lodash'

import { render } from 'tree-from-paths'



// const {promisify} = require('util');

import Pando0x from '@pando0x'
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
  
  public pando0x: Pando0x
  public paths: IPaths = { ...Repository.paths }
  public dao?: DAO
  
  public ipfs: any
  public ipld: any
  public satellizer: any
  
  public constructor (_pando0x: Pando0x, _path: string = '.', opts?: any) {
    this.pando0x = _pando0x
    for (let p in Repository.paths) { this.paths[p] = path.join(_path, Repository.paths[p]) }
  }
  
  public static exists (_path: string = '.'): boolean {
    return utils.fs.exists(path.join(_path, Repository.paths['pando']))
  }
  
  public static at (_path: string = '.') {
    
  }
  
  public async initialize (): Promise < void > {
    return new Promise < void > (async (resolve, reject) => {
      let configuration = this.pando0x.configuration

      try {
        if(utils.fs.exists(this.paths.conf)) {
          throw new Error('A pando repository already exists in the current working directory')
        }
        
        await utils.fs.mkdir(this.paths.pando)
        await utils.fs.mkdir(this.paths.tmp)
        await utils.fs.mkdir(this.paths.refs)
        await utils.json.write(this.paths.conf, configuration)
        await utils.json.write(this.paths.index, {})
        await utils.json.write(this.paths.head, 'undefined')

        this.ipfs = new IPFS({ repo: this.paths.ipfs })

        this.ipfs.on('ready', async () => {
          this.satellizer = new Satellizer(this.ipfs)
          await this.ipfs.stop()
          resolve()
        })
       
        this.ipfs.on('error', async (err) => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
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
      let _path = path.relative('.', _files[_file].path)
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
        console.log(_path + ' has been deleted')
        index[_path].mtime = Date.now()
        index[_path].wdir = 'null'
      }
      delete copy[_path]
    }
    
    for (let _path in copy) {
      // File has been added
      let file = [ { path: _path, content: fs.readFileSync(_path) } ]
      let results = await this.ipfs.files.add(file, { 'only-hash': true })
      let cid = results[0].hash

      
      index[_path] = { mtime: files[_path].mtime, wdir: cid, stage: 'null', repo: 'null' }
    }
    
    this.index = index
    
    // IL FAUT V2RIFIER SI UN NOUVEAU FICHIER A ETE CREE !
    
    // console.log(files)
    // 
    // for (let _file of files) {
    // 
    // 
    // 
    //   console.log('FILE')
    //   let relative = path.relative('.', _file.path)
    //   console.log(relative)
    //   console.log('MTIME: ' + _file.stats.mtime)
    //   let date = new Date(_file.stats.mtime)
    //   console.log(date)
    //   let file = [ { path: relative, content: fs.readFileSync(relative) } ]
    //   let cid = await this.ipfs.files.add(file, { 'only-hash': true })
    //   console.log(cid)
    //   index_[relative] = { mtime: _file.stats.mtime, wdir: cid[0].hash, stage: index[relative].stage || 'null', repo: index[relative].repo || 'null' }
    // }
    // 
    // this.index = index_
    // 
    
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
  
  public async add (files: string[]): Promise < any > {
    
    // need to normalize paths
    
    await this.updateIndex()
    let index = this.index
    
    for (let _file of files) {
      let file = [{ path: _file, content: fs.readFileSync(_file) }]
      let result = await this.ipfs.files.add(file)
      index[_file].stage = result[0].hash
    }
    
    this.index = index
    
    
//     console.log(files)
// 
//     let result
// 
//     const files_ = [
//         {
//           path: files[0],
//           content: fs.readFileSync(files[0])
//         }
//       ]
// 
//       let self = this
// 
//       let TT: any
// 
// this.ipfs.files.add(files_, function (err, _files) {
// 
//   TT = _files[0]
//   TT.name = path.basename(TT.path)
//   delete TT.path
// 
//   _files.forEach(async (file) => {
// 
//       console.log('file')
//       console.log(file)
//       result = await self.satellizer.get(file.hash)
//       console.log('Result')
//       console.log(result)
//     })
// 
//     self.ipfs.object.new('unixfs-dir', (err, node) => {
//       if (err) {
//         throw err
//       }
//       console.log('NODE')
//       console.log(node.toJSON())
// 
// 
//       console.log('MULTIHASH :' +node.toJSON().multihash)
// 
//       self.ipfs.object.patch.addLink(node.toJSON().multihash, TT, (err, newNode) => {
//         if (err) {
//           throw err
//         }
//         console.log('newNode')
//         console.log(newNode)
//       })
//   // Logs:
//   // QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
//   })
// 
// 
// 
// 
//   // 'files' will be an array of objects containing paths and the multihashes of the files added
// })
    
    // this.ipfs.files.ls('/screenshots', function (err, files) {
    //   files.forEach((file) => {
    //     console.log(file.name)
    //   })
    // })
    
    
    
  }
  
  public async commit(_message: string): Promise < any > {
    
    let commit = {
      '@type': 'commit',
      'timestamp': Date.now(),
      // 'parent': { '/': conf.getHead() },
      'tree': '',
      'author': this.pando0x.configuration.user.account,
      'message': _message
    }  
    
    
    let index: any = this.index
    let paths: any[] = []
    
    for (let path in index) {
      if (index[path].repo !== index[path].stage) {
        paths.push(path)
        console.log('we are gonna commit ' + path)
        
      }
    }
    
    // let paths = [ 'test/test2/test1.md', 'test/test2/test2.md', 'test/test3.md' ]

    // let cids
    // 
    // if is file
    //   push file
    //   return cid
    // 
    // else {
    //   for each children {
    //     cids.push(recurvise(child))
    //   }
    // 
    //   create node(cids)
    //   push node
    //   return cid of node
    // }
    
    let tree = this.tree(paths)
    
    let cid = await this.pushTree(tree)
    
    return cid
    
    // console.log(test)
    
    
    
    // let results = this.ipfs.files.add(files_, function (err, _files) {
    // 
    //   TT = _files[0]
    //   TT.name = path.basename(TT.path)
    //   delete TT.path
    // 
    //   _files.forEach(async (file) => {
    // 
    //       console.log('file')
    //       console.log(file)
    //       result = await self.satellizer.get(file.hash)
    //       console.log('Result')
    //       console.log(result)
    //     })
    // 
    //     self.ipfs.object.new('unixfs-dir', (err, node) => {
    //       if (err) {
    //         throw err
    //       }
    //       console.log('NODE')
    //       console.log(node.toJSON())
    // 
    // 
    //       console.log('MULTIHASH :' +node.toJSON().multihash)
    // 
    //       self.ipfs.object.patch.addLink(node.toJSON().multihash, TT, (err, newNode) => {
    //         if (err) {
    //           throw err
    //         }
    //         console.log('newNode')
    //         console.log(newNode)
    //       })
    //   // Logs:
    //   // QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
    
    
    
    // let cid = await this.satellizer.put(commit)
    
    
  }
  
  public async pushTree (tree: any[]): Promise < any > {
    
    let index = this.index
    
    console.log(tree)
    
    for (let entry of tree) {
      console.log('Pushing entry ' + entry.path)
      if(index[entry.path]) {
        
        let file = [{ path: entry.path, content: fs.readFileSync(entry.path) }]
        let results = await this.ipfs.files.add(file)
        console.log(results)
        results[0].name = path.basename(results[0].path)
        delete results[0].path
        // let cid = results[0].hash
        console.log('Uploaded ' + entry.path + ' with cid ' + results[0].hash)
        return results[0]
      
      } else {
        let results: string[] = []
        for (let child of entry.children) {
          console.log('Going to children for: ' + entry.path + " :: " + child.path)
          let r = await this.pushTree([child])
          console.log(r)
          results.push(r)
          
          // TT = _files[0]
          //   TT.name = path.basename(TT.path)
          //   delete TT.path
          
        }
        
        let node = await this.ipfs.object.new('unixfs-dir')
        // let test
        
        for (let result of results) {
          console.log('RESULT we add as a link : ' + result)
          node = await this.ipfs.object.patch.addLink(node.toJSON().multihash, result)
          console.log('Added link: ' + node)
        }
        
        return node
        
        // await this.ipfs.
        //       if (err) {
        //         throw err
        //       }
        //       console.log('NODE')
        //       console.log(node.toJSON())
        // 
        // 
        //       console.log('MULTIHASH :' +node.toJSON().multihash)
        // 
        //       self.ipfs.object.patch.addLink(node.toJSON().multihash, TT, (err, newNode) => {
        //         if (err) {
        //           throw err
        //         }
        //         console.log('newNode')
        //         console.log(newNode)
        //       })
        //   // Logs:
        //   // QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
        
      }
      // console.log(path)
      
      // const files_ = [
      //         {
      //           path: files[0],
      //           content: fs.readFileSync(files[0])
      //         }
      //       ]
      // 
      //       let self = this
      // 
      //       let TT: any
      // 
      // this.ipfs.files.add(files_, function (err, _files) {
      
    }

    // let cids
    // 
    // if is file
    //   push file
    //   return cid
    // 
    // else {
    //   for each children {
    //     cids.push(recurvise(child))
    //   }
    // 
    //   create node(cids)
    //   push node
    //   return cid of node
    // }
    
    
    
  }
  
  private tree (paths: string[]): any {
    let tree = []

    // Il faut faire en sorte que le path enregistré soit complet après pour le mettre sur IPFS 

    for (let _path of paths) {
      let parts = _path.split('/')
      let level: any = tree

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