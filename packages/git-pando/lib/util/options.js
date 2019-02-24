"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var die_1 = __importDefault(require("./die"));
exports.default = (function (path) {
    if (!fs_extra_1.default.pathExistsSync(path))
        die_1.default("No configuration file found. Run 'git-pando config' and come back to us.");
    return JSON.parse(fs_extra_1.default.readFileSync(path).toString());
});
//# sourceMappingURL=options.js.map