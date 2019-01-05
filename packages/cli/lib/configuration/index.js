"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var find_up_1 = __importDefault(require("find-up"));
var fs_1 = __importDefault(require("fs"));
var defaults = {
    "ethereum": {
        "account": "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"
    }
};
exports.default = (function () {
    var cpath = find_up_1.default.sync(['.pandorc', '.pandorc.json'], { cwd: path_1.default.join(process.cwd(), '.pando') });
    return cpath ? { configuration: JSON.parse(fs_1.default.readFileSync(cpath).toString()) } : { configuration: defaults };
});
//# sourceMappingURL=index.js.map