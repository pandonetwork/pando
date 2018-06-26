"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var commands = require("./commands");
program
    .command('init')
    .description('init a pando repository')
    .action(commands.init);
program
    .command('add <files...>')
    .description('stage files to commit')
    .action(commands.add);
program.parse(process.argv);
//# sourceMappingURL=index.js.map