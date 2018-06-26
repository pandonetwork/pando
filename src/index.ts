// import * as program from 'commander'
// var program = require('commander');
// import program from 'commander'
import * as commands  from './commands'
import * as functions from './functions'
import yargs from 'yargs'


var branch_list_yargs = function () {
  return yargs
      .option('verbose2', {
          alias: 'v2',
          describe: 'verbose2 output'
      })
      .usage('toto tata')
      .help()
}

var branch_yargs = () => {
  return yargs
    .usage('pando branch <subcommand>')
    .command('list', 'list branches', branch_list_yargs, (argv) => {
    })
    .command('list', 'list branches', branch_list_yargs, (argv) => {
    })
    .updateStrings({
        'Commands:': 'Subcommands:'
    })
    .demandCommand(1, 'No subcommand provided')
}

// var specimen_yargs = () => {
//   return yargs
//     .usage('pando specimen <subcommand>')
//     .command('list',   'List remote specimens',  branch_list_yargs, (argv) => {
//     })
//     .command('add',    'Add remote specimen',    branch_list_yargs, (argv) => {
//     })
//     .command('deploy', 'Deploy remote specimen', branch_list_yargs, (argv) => {
//     })
//     .updateStrings({ 'Commands:': 'Subcommands:' })
//     .demandCommand(2, 'No subcommand provided')
// }

var argv = yargs
    .usage('pando <command>')
    .command(commands.configure)
    .command(commands.init)
    .command(commands.stage)
    // .command('stage    <files...>'     , 'Stage files'                   , () => {}, (argv) => {
    //   console.log(argv.files)
    // })
    .command(commands.snapshot)
    // .command('specimen <subcommand>', 'Handle specimens'              , commands.specimen)
    .command(commands.branch)
    .demandCommand(1, 'No command provided')
    .help()
    .alias('h', 'help')
    .argv


// yargs.command({
//     command: 'branch <command>',
//     aliases: ['config', 'cfg'],
//     desc: 'Set a config variable',
//     // builder: (yargs) => yargs.default('command', 'list'),
//     handler: (yargs, argv) => {
//       // console.log(`setting ${argv.key} to ${argv.value}`)
//       return yargs
//         .command({
//             command: 'list',
//             desc: 'list local and remote banches',
//             handler: (yargs, argv) => {
//               // console.log(`setting ${argv.key} to ${argv.value}`)
//               console.log('JE LISTE')
//             }
//         })
//         .help()
//     }
//   })
//   // provide a minimum demand and a minimum demand message
//   .demandCommand(1, 'You need at least one command before moving on')
//   .help()
//   .argv

// var argv = yargs.usage("$0 command")
//   .command("branch", "handle branches", (yargs) => {
//     return yargs
//       .command("list", "fait comme ci comme ça", (yargs) => {
//         console.log("committed")
//     })
//   })
//   .required(1, "subcommand is requested" )
//   .command("push", "push changes up to GitHub")
//   .command("deploy", "commit and push changes in one step")
//   .demand(1, "must provide a valid command")
//   .help("h")
//   .alias("h", "help")
//   .argv

// program
//   .command('configure')
//   .alias('config')
//   .description('globally configure pando')
//   .action(commands.configure)
// program
//   .command('init')
//   .description('init a pando repository')
//   .action(commands.init)
// program
//   .command('stage <files...>')
//   .alias('add')
//   .description('stage files to commit')
//   .action(commands.stage)
// program
//   .command('specimen [command] [options]')
//   .alias('remote')
//   .description('stage files to commit')
//   .action(function(input, output, vars){
//     console.log('input', input);
//     console.log('output', output);
//     console.log('vars', vars);
// 
//     console.log('ARGS')
//     console.log(output.parent.args);
//   })
// 
// 
// program.parse(process.argv)
