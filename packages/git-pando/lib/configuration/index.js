"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var find_up_1 = __importDefault(require("find-up"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
exports.default = (function () {
    var gitDir = find_up_1.default.sync('.git', { cwd: path_1.default.join(process.cwd(), '.git') });
    var options = gitDir ? find_up_1.default.sync('pandorc', { cwd: path_1.default.join(gitDir, 'pando') }) : path_1.default.join(os_1.default.homedir(), '.pandorc');
    return { gitDir: gitDir, options: options };
});
//# sourceMappingURL=index.js.map