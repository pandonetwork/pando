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
// import register from 'module-alias/register'
//
// import Branch from '@components/branch'
// import Index from '@components/index'
// import Remote from '@components/remote'
var path_1 = __importDefault(require("path"));
var repository_1 = __importDefault(require("../components/repository"));
var repository_factory_1 = __importDefault(require("../factories/repository-factory"));
var utils = __importStar(require("../utils"));
// import File from '@objects/file'
// import IPLDNode from '@objects/ipld-node'
// import Snapshot from '@objects/snapshot'
// import Tree from '@objects/tree'
var PandoContracts = __importStar(require("./contracts"));
var PandoUtils = __importStar(require("./utils"));
// Web3.providers.HttpProvider.prototype.sendAsync =
//   Web3.providers.HttpProvider.prototype.send
var Pando = /** @class */ (function () {
    function Pando(config) {
        this.repositories = new repository_factory_1.default(this);
        this.config = config;
        this.web3 = Pando.utils.web3.get(config.ethereum);
        this.contracts = Pando.contracts.initialize(this.web3, config.author.account);
    }
    Pando.create = function (configuration) {
        var pando = new Pando(configuration);
        return pando;
    };
    Pando.load = function (path) {
        if (path === void 0) { path = '.'; }
        if (!repository_1.default.exists(path)) {
            throw new Error('No repository found at ' + path);
        }
        var configuration = utils.yaml.read(path_1.default.join(path, repository_1.default.paths.config));
        var pando = new Pando(configuration);
        return pando;
    };
    Pando.contracts = PandoContracts;
    Pando.utils = PandoUtils;
    return Pando;
}());
exports.default = Pando;
// export { Snapshot, Tree, File, IPLDNode, Repository, Index, Branch, Remote }
//# sourceMappingURL=index.js.map