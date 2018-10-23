"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var rimraf_1 = __importDefault(require("rimraf"));
exports.read = function (path) {
    return fs.readFileSync(path);
};
exports.write = function (path, data) {
    return fs.writeFileSync(path, data);
};
exports.exists = function (path) {
    return fs.existsSync(path);
};
exports.rm = function (path) {
    return rimraf_1.default.sync(path);
};
exports.mkdir = function (path) {
    return fs.mkdirSync(path);
};
//# sourceMappingURL=fs.js.map