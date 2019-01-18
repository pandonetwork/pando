import chalk from 'chalk'
import figures from 'figures'

/* tslint:disable:no-console */
// export const info = (message: string) => {
//   console.log(chalk.blue(message))
// }
//
export const list = (entries: any[]) => {
  for (const entry of entries) {
    if (entry.current) {
      console.log(figures('❯ ') + chalk.green(entry.name))
    } else {
      console.log(figures('  ') + entry.name)
    }
  }
}
//
// export const success = (message: string) => {
//   // console.log(chalk.green(message))
//   //
//   // import figures from 'figures'
//
//   console.log(figures('✔︎ ') + message)
// }
//
// export const error = (message: string) => {
//   console.log(chalk.red(figures('✖ ') + message))
// }
//
// export const status = (say: string, params?: string) => {
//   process.stdout.write('[' + chalk.magenta(say) + ']')
//   if (params) {
//     process.stdout.write('[' + params + ']')
//   }
//   process.stdout.write('\n')
// }
/* tslint:enable:no-console */
