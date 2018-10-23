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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var remote_1 = __importDefault(require("../components/remote"));
var utils = __importStar(require("../utils"));
var RemoteFactory = /** @class */ (function () {
    function RemoteFactory(repository) {
        this.repository = repository;
    }
    RemoteFactory.prototype.deploy = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var kernelBase, aclBase, factory, appProxyFactory, receipt, kernelAddress, kernel, acl, _a, _b, APP_MANAGER_ROLE, receipt2, APP_BASE_NAMESPACE, APP_NAMESPACE, tree, initializationPayload, appProxy, address, PUSH, receipt4, remote, master;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.exists(name)) {
                            throw new Error("Remote '" + name + "' already exists");
                        }
                        return [4 /*yield*/, this.repository.pando.contracts.kernel.new()];
                    case 1:
                        kernelBase = _c.sent();
                        return [4 /*yield*/, this.repository.pando.contracts.acl.new()];
                    case 2:
                        aclBase = _c.sent();
                        return [4 /*yield*/, this.repository.pando.contracts.daoFactory.new(kernelBase.address, aclBase.address, '0x00')];
                    case 3:
                        factory = _c.sent();
                        return [4 /*yield*/, this.repository.pando.contracts.appProxyFactory.new()
                            // Deploy aragonOS-based DAO
                        ];
                    case 4:
                        appProxyFactory = _c.sent();
                        return [4 /*yield*/, factory.newDAO(this.repository.config.author.account)];
                    case 5:
                        receipt = _c.sent();
                        kernelAddress = receipt.logs.filter(function (l) { return l.event === 'DeployDAO'; })[0]
                            .args.dao;
                        return [4 /*yield*/, this.repository.pando.contracts.kernel.at(kernelAddress)];
                    case 6:
                        kernel = _c.sent();
                        _b = (_a = this.repository.pando.contracts.acl).at;
                        return [4 /*yield*/, kernel.acl()];
                    case 7: return [4 /*yield*/, _b.apply(_a, [_c.sent()])
                        // Grant current author APP_MANAGER_ROLE over the DAO
                    ];
                    case 8:
                        acl = _c.sent();
                        return [4 /*yield*/, kernel.APP_MANAGER_ROLE()];
                    case 9:
                        APP_MANAGER_ROLE = _c.sent();
                        return [4 /*yield*/, acl.createPermission(this.repository.config.author.account, kernel.address, APP_MANAGER_ROLE, this.repository.config.author.account)
                            // // Deploy tree app
                        ];
                    case 10:
                        receipt2 = _c.sent();
                        return [4 /*yield*/, kernel.APP_BASES_NAMESPACE()];
                    case 11:
                        APP_BASE_NAMESPACE = _c.sent();
                        return [4 /*yield*/, kernel.APP_ADDR_NAMESPACE()];
                    case 12:
                        APP_NAMESPACE = _c.sent();
                        return [4 /*yield*/, this.repository.pando.contracts.tree.new()
                            // const receipt3 = await kernel.newAppInstance(
                            //   Remote.TREE_BASE_APP_ID,
                            //   tree.address
                            // )
                            // await kernel.setApp(
                            //   APP_BASE_NAMESPACE,
                            //   Remote.TREE_BASE_APP_ID,
                            //   tree.address
                            // )
                        ];
                    case 13:
                        tree = _c.sent();
                        // const receipt3 = await kernel.newAppInstance(
                        //   Remote.TREE_BASE_APP_ID,
                        //   tree.address
                        // )
                        // await kernel.setApp(
                        //   APP_BASE_NAMESPACE,
                        //   Remote.TREE_BASE_APP_ID,
                        //   tree.address
                        // )
                        return [4 /*yield*/, kernel.setApp(remote_1.default.APP_BASE_NAMESPACE, remote_1.default.TREE_BASE_APP_ID, tree.address)];
                    case 14:
                        // const receipt3 = await kernel.newAppInstance(
                        //   Remote.TREE_BASE_APP_ID,
                        //   tree.address
                        // )
                        // await kernel.setApp(
                        //   APP_BASE_NAMESPACE,
                        //   Remote.TREE_BASE_APP_ID,
                        //   tree.address
                        // )
                        _c.sent();
                        initializationPayload = tree.contract.initialize.getData();
                        return [4 /*yield*/, this.repository.pando.contracts.appProxyUpgradeable.new(kernel.address, remote_1.default.TREE_BASE_APP_ID, initializationPayload, { gas: 6e6 })];
                    case 15:
                        appProxy = _c.sent();
                        address = appProxy.address;
                        return [4 /*yield*/, kernel.setApp(APP_NAMESPACE, remote_1.default.TREE_BASE_APP_ID, appProxy.address)
                            // const appProxy = await appProxyFactory.newAppProxy(
                            //   kernel.address,
                            //   Remote.TREE_BASE_APP_ID,
                            //   initializationPayload
                            // )
                            //
                            // const address = appProxy.logs.filter(l => l.event === 'NewAppProxy')[0].args
                            //   .proxy
                        ];
                    case 16:
                        _c.sent();
                        return [4 /*yield*/, this.repository.pando.contracts.tree.at(address)
                            // await kernel.setApp(
                            //   Remote.APP_BASE_NAMESPACE,
                            //   Remote.TREE_BASE_APP_ID,
                            //   appProxy.address
                            // )
                            // // Create PUSH role
                        ];
                    case 17:
                        // const appProxy = await appProxyFactory.newAppProxy(
                        //   kernel.address,
                        //   Remote.TREE_BASE_APP_ID,
                        //   initializationPayload
                        // )
                        //
                        // const address = appProxy.logs.filter(l => l.event === 'NewAppProxy')[0].args
                        //   .proxy
                        tree = _c.sent();
                        return [4 /*yield*/, tree.PUSH()];
                    case 18:
                        PUSH = _c.sent();
                        return [4 /*yield*/, acl.createPermission(this.repository.config.author.account, tree.address, PUSH, this.repository.config.author.account)
                            // // Save remote's address
                        ];
                    case 19:
                        receipt4 = _c.sent();
                        // // Save remote's address
                        this.saveAddress(name, kernel.address);
                        remote = new remote_1.default(this.repository, kernel, acl, tree, name);
                        return [4 /*yield*/, remote.branches.create('master')];
                    case 20:
                        master = _c.sent();
                        return [2 /*return*/, remote
                            // const { kernel, acl, tree } = await Remote.deploy(this.repository)
                            // this.saveAddress(name, kernel.address)
                            // const remote = new Remote(this.repository, kernel, acl, tree, name)
                            // const master = await this.repository.branches.create('master', {
                            //   remote: name
                            // })
                            // return remote
                        ];
                }
            });
        });
    };
    RemoteFactory.prototype.at = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, kernel, acl, tree;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, remote_1.default.at(this.repository, address)];
                    case 1:
                        _a = _b.sent(), kernel = _a.kernel, acl = _a.acl, tree = _a.tree;
                        return [2 /*return*/, { kernel: kernel, acl: acl, tree: tree }];
                }
            });
        });
    };
    RemoteFactory.prototype.load = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var address, _a, kernel, acl, tree, remote;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.exists(name)) {
                            throw new Error("Remote '" + name + "' does not exist");
                        }
                        address = this.loadAddress(name);
                        return [4 /*yield*/, this.at(address)];
                    case 1:
                        _a = _b.sent(), kernel = _a.kernel, acl = _a.acl, tree = _a.tree;
                        remote = new remote_1.default(this.repository, kernel, acl, tree, name);
                        return [2 /*return*/, remote];
                }
            });
        });
    };
    RemoteFactory.prototype.add = function (name, address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, kernel, acl, tree, remote, branches, _i, branches_1, branch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.exists(name)) {
                            throw new Error("Remote '" + name + "' already exists");
                        }
                        return [4 /*yield*/, remote_1.default.at(this.repository, address)];
                    case 1:
                        _a = _b.sent(), kernel = _a.kernel, acl = _a.acl, tree = _a.tree;
                        remote = new remote_1.default(this.repository, kernel, acl, tree, name);
                        this.saveAddress(name, kernel.address);
                        return [4 /*yield*/, remote.branches.list()];
                    case 2:
                        branches = _b.sent();
                        _i = 0, branches_1 = branches;
                        _b.label = 3;
                    case 3:
                        if (!(_i < branches_1.length)) return [3 /*break*/, 6];
                        branch = branches_1[_i];
                        return [4 /*yield*/, this.repository.branches.create(branch, { remote: name })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, remote];
                }
            });
        });
    };
    RemoteFactory.prototype.exists = function (name) {
        return utils.fs.exists(path_1.default.join(this.repository.paths.remotes, name));
    };
    RemoteFactory.prototype.saveAddress = function (name, address) {
        return utils.yaml.write(path_1.default.join(this.repository.paths.remotes, name), address);
    };
    RemoteFactory.prototype.loadAddress = function (name) {
        return utils.yaml.read(path_1.default.join(this.repository.paths.remotes, name));
    };
    return RemoteFactory;
}());
exports.default = RemoteFactory;
//# sourceMappingURL=remote-factory.js.map