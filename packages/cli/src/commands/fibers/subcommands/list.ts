import Pando from '@pando/pando.js'
import chalk from 'chalk'
import figures from 'figures'
import yargs from 'yargs'
import * as display from '../../../ui/display'

const builder = () => {
  return yargs
    .help()
    .strict(false)
    .version(false)
}

const handler = async argv => {
  let pando

  try {
    pando = await Pando.create(argv.configuration)
    const plant = await pando.plants.load()
    const fibers = await plant.fibers.list()
    display.list(fibers)
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const list = {
  command: 'list',
  aliases: ['ls'],
  desc: 'List fibers',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
