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
var branch_1 = __importDefault(require("@components/branch"));
exports.Branch = branch_1.default;
var index_1 = __importDefault(require("@components/index"));
exports.Index = index_1.default;
var remote_1 = __importDefault(require("@components/remote"));
exports.Remote = remote_1.default;
var repository_1 = __importDefault(require("@components/repository"));
exports.Repository = repository_1.default;
var repository_factory_1 = __importDefault(require("@factories/repository-factory"));
var file_1 = __importDefault(require("@objects/file"));
exports.File = file_1.default;
var ipld_node_1 = __importDefault(require("@objects/ipld-node"));
exports.IPLDNode = ipld_node_1.default;
var snapshot_1 = __importDefault(require("@objects/snapshot"));
exports.Snapshot = snapshot_1.default;
var tree_1 = __importDefault(require("@objects/tree"));
exports.Tree = tree_1.default;
var PandoContracts = __importStar(require("@root/contracts"));
var PandoUtils = __importStar(require("@root/utils"));
var utils = __importStar(require("@utils"));
var path_1 = __importDefault(require("path"));
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
//# sourceMappingURL=index.js.map