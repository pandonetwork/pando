import chalk from 'chalk'

/* tslint:disable:no-console */
export const info = (message: string) => {
  console.log(chalk.blue(message))
}

export const success = (message: string) => {
  console.log(chalk.green(message))
}

export const error = (message: string) => {
  console.log(chalk.red(message))
}
/* tslint:enable:no-console */
