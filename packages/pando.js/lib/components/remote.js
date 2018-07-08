"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var remote_branch_factory_1 = __importDefault(require("@factories/remote-branch-factory"));
var eth_ens_namehash_1 = require("eth-ens-namehash");
var ethereum_regex_1 = __importDefault(require("ethereum-regex"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var js_sha3_1 = require("js-sha3");
var web3_utils_1 = __importDefault(require("web3-utils"));
var Remote = /** @class */ (function () {
    function Remote(repository, kernel, acl, tree, name) {
        this.branches = new remote_branch_factory_1.default(this);
        this.repository = repository;
        this.name = name;
        this.kernel = kernel;
        this.acl = acl;
        this.tree = tree;
    }
    Remote.at = function (repository, kernelAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var kernel, acl, _a, _b, address, address2, tree, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, repository.pando.contracts.kernel.at(kernelAddress)];
                    case 1:
                        kernel = _e.sent();
                        _b = (_a = repository.pando.contracts.acl).at;
                        return [4 /*yield*/, kernel.acl()];
                    case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                    case 3:
                        acl = _e.sent();
                        return [4 /*yield*/, kernel.getApp(Remote.TREE_APP_ID)];
                    case 4:
                        address = _e.sent();
                        return [4 /*yield*/, kernel.getApp(Remote.PROXY_APP_ID)];
                    case 5:
                        address2 = _e.sent();
                        _d = (_c = repository.pando.contracts.tree).at;
                        return [4 /*yield*/, kernel.getApp(Remote.PROXY_APP_ID)];
                    case 6: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                    case 7:
                        tree = _e.sent();
                        return [2 /*return*/, { kernel: kernel, acl: acl, tree: tree }];
                }
            });
        });
    };
    Remote.prototype.push = function (branch, cid) {
        return __awaiter(this, void 0, void 0, function () {
            var PUSH, PERM, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tree.PUSH()];
                    case 1:
                        PUSH = _a.sent();
                        return [4 /*yield*/, this.acl.hasPermission(this.repository.config.author.account, this.tree.address, PUSH)];
                    case 2:
                        PERM = _a.sent();
                        if (!this.repository.branches.exists(branch, { remote: this.name })) {
                            throw new Error("Branch '" + this.name + ':' + branch + "' does not exist'");
                        }
                        if (!is_ipfs_1.default.cid(cid)) {
                            throw new Error('CID ' + cid + ' is not valid');
                        }
                        if (!PERM) {
                            throw new Error("You do not own PUSH role over remote '" + this.name + "'");
                        }
                        return [4 /*yield*/, this.tree.setHead(branch, cid, {
                                from: this.repository.config.author.account
                            })];
                    case 3:
                        receipt = _a.sent();
                        return [2 /*return*/, receipt];
                }
            });
        });
    };
    Remote.prototype.head = function (branch) {
        return __awaiter(this, void 0, void 0, function () {
            var head;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.repository.branches.exists(branch, { remote: this.name })) {
                            throw new Error("Branch '" + this.name + ':' + branch + "' does not exist'");
                        }
                        return [4 /*yield*/, this.tree.getHead(branch)];
                    case 1:
                        head = _a.sent();
                        return [2 /*return*/, head];
                }
            });
        });
    };
    Remote.prototype.fetch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var branches, heads, _i, branches_1, branchName, head, branch, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.branches.list()];
                    case 1:
                        branches = _c.sent();
                        heads = {};
                        _i = 0, branches_1 = branches;
                        _c.label = 2;
                    case 2:
                        if (!(_i < branches_1.length)) return [3 /*break*/, 7];
                        branchName = branches_1[_i];
                        return [4 /*yield*/, this.head(branchName)];
                    case 3:
                        head = _c.sent();
                        return [4 /*yield*/, this.repository.branches.load(branchName, {
                                remote: this.name
                            })];
                    case 4:
                        branch = _c.sent();
                        branch.head = head;
                        _a = heads;
                        _b = branchName;
                        return [4 /*yield*/, this.head(branchName)];
                    case 5:
                        _a[_b] = _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, heads];
                }
            });
        });
    };
    Remote.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var branches, remote, _i, branches_2, branch, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.branches.list()];
                    case 1:
                        branches = _d.sent();
                        remote = {
                            acl: this.acl.address,
                            branches: {},
                            kernel: this.kernel.address,
                            tree: this.tree.address
                        };
                        _i = 0, branches_2 = branches;
                        _d.label = 2;
                    case 2:
                        if (!(_i < branches_2.length)) return [3 /*break*/, 5];
                        branch = branches_2[_i];
                        _a = remote.branches;
                        _b = branch;
                        _c = {};
                        return [4 /*yield*/, this.head(branch)];
                    case 3:
                        _a[_b] = (_c.head = _d.sent(), _c);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, remote];
                }
            });
        });
    };
    Remote.prototype.grant = function (what, who) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, _a, PUSH;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ethereum_regex_1.default({ exact: true }).test(who)) {
                            throw new TypeError("'" + who + "' is not a valid ethereum address");
                        }
                        _a = what;
                        switch (_a) {
                            case 'PUSH': return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 4];
                    case 1: return [4 /*yield*/, this.tree.PUSH()];
                    case 2:
                        PUSH = _b.sent();
                        return [4 /*yield*/, this.acl.grantPermission(who, this.tree.address, PUSH, {
                                from: this.repository.config.author.account
                            })];
                    case 3:
                        receipt = _b.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new TypeError("'" + what + "' is not a valid role");
                    case 5: return [2 /*return*/, receipt];
                }
            });
        });
    };
    Remote.APP_NAMESPACE = '0x' + js_sha3_1.keccak256('app');
    Remote.APP_BASE_NAMESPACE = '0x' + js_sha3_1.keccak256('base');
    Remote.TREE_BASE_APP_ID = eth_ens_namehash_1.hash('tree.pando.aragonpm.test');
    Remote.TREE_APP_ID = web3_utils_1.default.sha3(Remote.APP_BASE_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2), { encoding: 'hex' });
    Remote.PROXY_APP_ID = web3_utils_1.default.sha3(Remote.APP_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2), { encoding: 'hex' });
    return Remote;
}());
exports.default = Remote;
//# sourceMappingURL=remote.js.map