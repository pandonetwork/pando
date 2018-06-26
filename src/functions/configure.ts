import Pando from 'pando-lib'
import os    from 'os'
import prompt from '@inquirer'
import * as config from '@lib/config'

export const configure = async () => {
  let results = await prompt.configure()
  config.save(results)
  // console.log(config.load())
}