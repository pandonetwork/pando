"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var figures_1 = __importDefault(require("figures"));
/* tslint:disable:no-console */
exports.info = function (message) {
    console.log(chalk_1.default.blue(message));
};
exports.success = function (message) {
    // console.log(chalk.green(message))
    //
    // import figures from 'figures'
    console.log(figures_1.default('✔︎ ') + message);
};
exports.error = function (message) {
    console.log(chalk_1.default.red(figures_1.default('✖ ') + message));
};
exports.status = function (say, params) {
    process.stdout.write('[' + chalk_1.default.magenta(say) + ']');
    if (params) {
        process.stdout.write('[' + params + ']');
    }
    process.stdout.write('\n');
};
/* tslint:enable:no-console */
//# sourceMappingURL=display.js.map