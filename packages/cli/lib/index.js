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
var config = configuration_1.default();
var argv = yargs_1.default
    .config(config)
    .usage('pando <command>')
    .command(commands.config)
    .command(commands.init)
    .command(commands.track)
    .command(commands.untrack)
    .command(commands.status)
    .command(commands.snapshot)
    .command(commands.log)
    .command(commands.revert)
    .command(commands.switch_)
    .command(commands.fibers)
    .command(commands.organizations)
    .command(commands.organisms)
    .demandCommand(1, 'No command provided')
    .strict()
    .help()
    .alias('h', 'help')
    .argv;
//# sourceMappingURL=index.js.map