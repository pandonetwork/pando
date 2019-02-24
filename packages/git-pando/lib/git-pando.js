#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = __importDefault(require("yargs"));
var commands = __importStar(require("./commands"));
var configuration_1 = __importDefault(require("./configuration"));
// 
// const c = configuration()
//
// console.log(c)
var argv = yargs_1.default
    .config(configuration_1.default())
    .usage('pando <command>')
    .command(commands.config)
    .command(commands.organization)
    .command(commands.repository)
    .demandCommand(1, 'No command provided')
    .strict()
    .help()
    .alias('h', 'help').argv;
//# sourceMappingURL=git-pando.js.map