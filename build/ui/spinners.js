"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ora = require('ora');
var chalk = require('chalk');
var info = chalk.bold.blue;
var success = chalk.bold.green;
var error = chalk.bold.red;
exports.configuration = {
    spinner: undefined,
    start: function () {
        this.spinner = ora(info('Initializing configuration files'));
        this.spinner.start();
    },
    succeed: function () {
        this.spinner.succeed(success('Configuration files initialized'));
    },
    fail: function (err) {
        this.spinner.fail(error('Failed to initialize configuration files. ' + err));
    }
};
exports.dao = {
    spinner: undefined,
    start: function () {
        this.spinner = ora(info('Deploying AragonOS-based DAO on the Ethereum blockchain'));
        this.spinner.start();
    },
    succeed: function (address) {
        this.spinner.succeed(success('AragonOS-based DAO deployed at ' + address));
    },
    fail: function (err) {
        this.spinner.fail(error('Failed to deploy dao: ' + err));
    }
};
// 
// colors.setTheme({ default: ['bold', 'blue'] })
// colors.setTheme({ succeed: ['bold', 'green'] })
// colors.setTheme({ fail: ['bold', 'red'] })
// 
// module.exports = {
// 
//   dao: {
//     spinner: undefined,
//     start: function (cid) {
//       this.spinner = ora('Deploying AragonOS-based DAO on the Ethereum blockchain'.default)
//       this.spinner.start()
//     },
//     succeed: function (dao) {
//       this.spinner.succeed(('AragonOS-based DAO deployed at ' + dao).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to deploy dao: ' + err).fail)
//     }
//   },
// 
//   appManagerRole: {
//     spinner: undefined,
//     start: function (cid) {
//       this.spinner = ora('Updating rights over the DAO'.default)
//       this.spinner.start()
//     },
//     succeed: function (account, dao) {
//       this.spinner.succeed(('APP_MANAGER_ROLE granted to ' + account + ' over ' + dao).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to update rights over the DAO: ' + err).fail)
//     }
//   },
// 
//   pando: {
//     spinner: undefined,
//     start: function () {
//       this.spinner = ora('Deploying pando repository as an AragonOS app'.default)
//       this.spinner.start()
//     },
//     succeed: function (pando) {
//       this.spinner.succeed(('Pando repository app deployed and initiatized at ' + pando).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to deployed pando repository app: ' + err).fail)
//     }
//   },
// 
//   pushRole: {
//     spinner: undefined,
//     start: function () {
//       this.spinner = ora('Updating rights over the pando repository app'.default)
//       this.spinner.start()
//     },
//     succeed: function (account, pando) {
//       this.spinner.succeed(('PUSH_ROLE granted to ' + account + ' over ' + pando).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to update rights over the pando repository app: ' + err).fail)
//     }
//   },
// 
//   commit: {
//     spinner: undefined,
//     start: function () {
//       this.spinner = ora('Committing changes'.default)
//       this.spinner.start()
//     },
//     succeed: function (cid) {
//       this.spinner.succeed(('Changes committed with cid ' + cid).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to commit changes: ' + err).fail)
//     }
//   },
// 
//   push: {
//     spinner: undefined,
//     start: function () {
//       this.spinner = ora('Pushing changes'.default)
//       this.spinner.start()
//     },
//     succeed: function (tx) {
//       this.spinner.succeed(('Repository pushed by tx ' + tx).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to push changes: ' + err).fail)
//     }
//   },
// 
//   revert: {
//     spinner: undefined,
//     start: function (cid) {
//       this.spinner = ora(('Reverting repository to commit ' + cid).default)
//       this.spinner.start()
//     },
//     succeed: function (cid) {
//       this.spinner.succeed(('Repository reverted to commit ' + cid).succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to revert: ' + err).fail)
//     }
//   },
// 
//   clone: {
//     spinner: undefined,
//     start: function (address) {
//       this.spinner = ora(('Cloning repository ' + address).default)
//       this.spinner.start()
//     },
//     succeed: function (address) {
//       this.spinner.succeed(('Repository ' + address + ' cloned').succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to clone repository: ' + err).fail)
//     }
//   },
// 
//   fetch: {
//     spinner: undefined,
//     start: function (address) {
//       this.spinner = ora(('Fetching repository').default)
//       this.spinner.start()
//     },
//     succeed: function (address) {
//       this.spinner.succeed(('Repository fetched').succeed)
//     },
//     fail: function (err) {
//       this.spinner.fail(('Failed to fetch repository: ' + err).fail)
//     }
//   }
// 
// }
//# sourceMappingURL=spinners.js.map