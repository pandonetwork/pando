"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var figures_1 = __importDefault(require("figures"));
var ora_1 = __importDefault(require("ora"));
/* tslint:disable:no-console */
// export const info = (message: string) => {
//   console.log(chalk.blue(message))
// }
//
exports.list = function (entries) {
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        if (entry.current) {
            console.log(figures_1.default('❯ ') + chalk_1.default.green(entry.name));
        }
        else {
            console.log(figures_1.default('  ') + entry.name);
        }
    }
};
exports.error = function (message) {
    return ora_1.default(chalk_1.default.dim(message)).fail();
};
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
//# sourceMappingURL=display.js.map