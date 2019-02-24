#!/usr/bin/env node

import fs from 'fs-extra'
import Helper from './helper'


const main = async () => {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: git-remote-pando <name> <url>')
    process.exit(1)
  }

  const alias = args[0] === args[1] ? '_' : args[0]
  const url = args[1]
  const helper = new Helper(alias, url)

  helper.initialize().then(_ => {
    helper.run()

  })
}

main()
