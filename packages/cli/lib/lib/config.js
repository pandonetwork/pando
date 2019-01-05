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
var utils = __importStar(require("@utils"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
exports.path = path_1.default.join(os_1.default.homedir(), '.pandoconfig');
exports.exists = function () {
    return utils.fs.exists(exports.path);
};
exports.save = function (data) {
    return utils.yaml.write(exports.path, data);
};
exports.load = function () {
    return utils.yaml.read(exports.path);
};
//# sourceMappingURL=config.js.map