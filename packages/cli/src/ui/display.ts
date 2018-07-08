import chalk from 'chalk'

/* tslint:disable:no-console */
export const info = (message: string) => {
  console.log(chalk.blue(message))
}

export const success = (message: string) => {
  console.log(chalk.green(message))
}

export const error = (message: string) => {
  process.stdout.write('[' + chalk.red('error') + ']')
  process.stdout.write('[' + chalk.red(message) + ']')
  process.stdout.write('\n')
}

export const status = (say: string, params?: string) => {
  process.stdout.write('[' + chalk.magenta(say) + ']')
  if (params) {
    process.stdout.write('[' + params + ']')
  }
  process.stdout.write('\n')
}
/* tslint:enable:no-console */
