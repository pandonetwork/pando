import Pando from          'pando-lib'
import * as config from    '@lib/config'
import { initialize } from '@spinners'

export const init = async () => {
  try {
    initialize.start()
    if (!config.exists()) { initialize.configFirst() }
    else {
      let pando = new Pando(config.load())
      let loom = await pando.loom.new()
      initialize.succeed(process.cwd())
    }
  } catch (err) {
    initialize.fail(err)
  }
}