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
var js_yaml_1 = __importDefault(require("js-yaml"));
var fs = __importStar(require("./fs"));
exports.read = function (path) {
    return js_yaml_1.default.safeLoad(fs.read(path));
};
exports.write = function (path, data, opts) {
    return fs.write(path, js_yaml_1.default.safeDump(data, opts));
};
//# sourceMappingURL=yaml.js.map