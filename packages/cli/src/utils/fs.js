"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
exports.mkdir = function (path) {
    return fs.mkdirSync(path);
};
exports.exists = function (path) {
    return fs.existsSync(path);
};
exports.write = function (path, data) {
    return fs.writeFileSync(path, data);
};
exports.read = function (path) {
    return fs.readFileSync(path);
};
