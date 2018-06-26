import Pando       from 'pando-lib'
import * as config from '@lib/config'

export const stage = async (_paths: string[]) => {
  let pando = new Pando(config.load())
  let loom  = await pando.loom.load(process.cwd())
  let index = await loom.stage(_paths)  
}