"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = require("inquirer");
var questions;
(function (questions) {
    questions.init = [
        {
            name: 'committer.name',
            type: 'input',
            message: 'Enter your name: ',
            validate: function (value) {
                if (value.length) {
                    return true;
                }
                else {
                    return 'Please enter your name.';
                }
            }
        },
        {
            name: 'committer.email',
            type: 'input',
            message: 'Enter your email: ',
            validate: function (value) {
                if (value.length) {
                    return true;
                }
                else {
                    return 'Please enter your email.';
                }
            }
        },
        {
            name: 'remote',
            type: 'list',
            message: 'Do you want to create a remote repository?',
            choices: ['yes', 'no'],
            default: 0
        },
        {
            name: 'node.address',
            type: 'input',
            message: 'Enter a valid Ethereum node url: ',
            default: 'http://localhost:8545',
            when: function (answers) {
                return answers.remote === 'yes';
            },
            validate: function (value) {
                var regex = new RegExp(/(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/);
                if (value.match(regex)) {
                    return true;
                }
                else {
                    return 'Please enter a valid Ethereum node url.';
                }
            }
        }
    ];
})(questions || (questions = {}));
exports.committer = function () {
    return inquirer.prompt(questions.init);
};
// const questions = [
//       {
//         name: 'committer.name',
//         type: 'input',
//         message: 'Enter your name: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your name.'
//           }
//         }
//       },
//       {
//         name: 'committer.email',
//         type: 'input',
//         message: 'Enter your email: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your email.'
//           }
//         }
//       }
//       {
//         name: 'remote',
//         type: 'list',
//         message: 'Do you want to create a remote repository?',
//         choices: ['yes', 'no'],
//         default: 0
//       }
//     ]
//     return inquirer.prompt(questions)
//   },
// }
// const inquirer = require('inquirer')
// const eth = require('../eth')
// 
// module.exports = {
// 
//   askBase: () => {
//     const questions = [
//       {
//         name: 'committer.name',
//         type: 'input',
//         message: 'Enter your name: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your name.'
//           }
//         }
//       },
//       {
//         name: 'committer.email',
//         type: 'input',
//         message: 'Enter your email: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your email.'
//           }
//         }
//       }
//       {
//         name: 'remote',
//         type: 'list',
//         message: 'Do you want to create a remote repository?',
//         choices: ['yes', 'no'],
//         default: 0
//       }
//     ]
//     return inquirer.prompt(questions)
//   },
// 
//   askRemote: () => {
//     const questions = [
//       {
//         name: 'node',
//         type: 'input',
//         message: 'Enter a valid Ethereum node url: ',
//         default: 'http://localhost:8545',
//         validate: function (value) {
//           const regex = new RegExp(/(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/)
//           if (value.match(regex)) {
//             return true
//           } else {
//             return 'Please enter a valid Ethereum node url.'
//           }
//         }
//       },
//       {
//         name: 'account',
//         type: 'list',
//         message: 'Select an account to identify yourself on the remote repository',
//         choices () {
//           return new Promise(async (resolve, reject) => {
//             try {
//               let accounts = await eth.accounts()
//               resolve(accounts)
//             } catch (err) {
//               reject(err)
//             }
//           })
//         },
//         default: 0
//       }
//     ]
//     return inquirer.prompt(questions)
//   },
// 
//   askClone: () => {
//     const questions = [
//       {
//         name: 'committer.name',
//         type: 'input',
//         message: 'Enter your name: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your name.'
//           }
//         }
//       },
//       {
//         name: 'committer.email',
//         type: 'input',
//         message: 'Enter your email: ',
//         validate: function (value) {
//           if (value.length) {
//             return true
//           } else {
//             return 'Please enter your email.'
//           }
//         }
//       },
//       {
//         name: 'node',
//         type: 'input',
//         message: 'Enter a valid Ethereum node url: ',
//         default: 'http://localhost:8545',
//         validate: function (value) {
//           const regex = new RegExp(/(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/)
//           if (value.match(regex)) {
//             return true
//           } else {
//             return 'Please enter a valid Ethereum node url.'
//           }
//         }
//       },
//       {
//         name: 'committer.address',
//         type: 'list',
//         message: 'Select an account to identify yourself on the remote repository',
//         choices () {
//           return new Promise(async (resolve, reject) => {
//             try {
//               let accounts = await eth.accounts()
//               resolve(accounts)
//             } catch (err) {
//               reject(err)
//             }
//           })
//         },
//         default: 0
//       }
//     ]
//     return inquirer.prompt(questions)
//   }
// }
//# sourceMappingURL=inquirer.js.map