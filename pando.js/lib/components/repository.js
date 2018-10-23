"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var cids_1 = __importDefault(require("cids"));
var path_1 = __importDefault(require("path"));
var branch_factory_1 = __importDefault(require("../factories/branch-factory"));
var remote_factory_1 = __importDefault(require("../factories/remote-factory"));
var file_1 = __importDefault(require("../objects/file"));
var snapshot_1 = __importDefault(require("../objects/snapshot"));
var tree_1 = __importDefault(require("../objects/tree"));
var utils = __importStar(require("../utils"));
var Repository = /** @class */ (function () {
    function Repository(pando, path, opts) {
        if (path === void 0) { path = '.'; }
        this.branches = new branch_factory_1.default(this);
        this.remotes = new remote_factory_1.default(this);
        this.paths = __assign({}, Repository.paths);
        for (var p in this.paths) {
            if (this.paths.hasOwnProperty(p)) {
                this.paths[p] = path_1.default.join(path, this.paths[p]);
            }
        }
        this.pando = pando;
    }
    /* tslint:enable:object-literal-sort-keys */
    Repository.remove = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                utils.fs.rm(path_1.default.join(path, Repository.paths.pando));
                return [2 /*return*/];
            });
        });
    };
    Repository.exists = function (path) {
        if (path === void 0) { path = '.'; }
        for (var p in Repository.paths) {
            if (Repository.paths.hasOwnProperty(p)) {
                var expected = path_1.default.join(path, Repository.paths[p]);
                if (!utils.fs.exists(expected)) {
                    return false;
                }
            }
        }
        return true;
    };
    Object.defineProperty(Repository.prototype, "currentBranchName", {
        get: function () {
            return utils.yaml.read(this.paths.current);
        },
        set: function (name) {
            utils.yaml.write(this.paths.current, name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "currentBranch", {
        get: function () {
            return this.branches.load(this.currentBranchName);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "head", {
        get: function () {
            return this.currentBranch.head;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "config", {
        get: function () {
            return utils.yaml.read(this.paths.config);
        },
        set: function (config) {
            utils.yaml.write(this.paths.config, config);
        },
        enumerable: true,
        configurable: true
    });
    Repository.prototype.stage = function (paths) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.index.stage(paths)];
                    case 1:
                        index = _a.sent();
                        return [2 /*return*/, index];
                }
            });
        });
    };
    Repository.prototype.snapshot = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var index, tree, parents, _a, snapshot, cid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.index.update()];
                    case 1:
                        index = _b.sent();
                        if (!this.index.unsnapshot.length) {
                            throw new Error('Nothing to snapshot');
                        }
                        return [4 /*yield*/, this.tree()];
                    case 2:
                        tree = _b.sent();
                        return [4 /*yield*/, tree.put(this.node)];
                    case 3:
                        _b.sent();
                        if (!(this.head !== 'undefined')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.fromCID(this.head)];
                    case 4:
                        _a = [_b.sent()];
                        return [3 /*break*/, 6];
                    case 5:
                        _a = [];
                        _b.label = 6;
                    case 6:
                        parents = _a;
                        snapshot = new snapshot_1.default({
                            author: this.pando.config.author,
                            message: message,
                            parents: parents,
                            tree: tree
                        });
                        return [4 /*yield*/, snapshot.put(this.node)];
                    case 7:
                        cid = _b.sent();
                        this.currentBranch.head = cid;
                        return [2 /*return*/, snapshot];
                }
            });
        });
    };
    Repository.prototype.push = function (remoteName, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var head, remote, remoteBranch, remoteHead, snapshot, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        head = this.head;
                        return [4 /*yield*/, this.remotes.load(remoteName)];
                    case 1:
                        remote = _a.sent();
                        return [4 /*yield*/, this.branches.load(branch, {
                                remote: remoteName
                            })];
                    case 2:
                        remoteBranch = _a.sent();
                        return [4 /*yield*/, remoteBranch.head];
                    case 3:
                        remoteHead = _a.sent();
                        if (head === 'undefined') {
                            throw new Error('Nothing to push');
                        }
                        if (remoteHead === head) {
                            throw new Error("Branch '" + branch + "' of remote '" + remoteName + "' is already up to date");
                        }
                        return [4 /*yield*/, this.fromCID(head)];
                    case 4:
                        snapshot = _a.sent();
                        return [4 /*yield*/, snapshot.put(this.node)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, remote.push(branch, head)];
                    case 6:
                        tx = _a.sent();
                        remoteBranch.head = head;
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    Repository.prototype.fetch = function (remotes) {
        return __awaiter(this, void 0, void 0, function () {
            var heads, _i, remotes_1, remoteName, remote, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        heads = {};
                        _i = 0, remotes_1 = remotes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < remotes_1.length)) return [3 /*break*/, 5];
                        remoteName = remotes_1[_i];
                        return [4 /*yield*/, this.remotes.load(remoteName)];
                    case 2:
                        remote = _c.sent();
                        _a = heads;
                        _b = remoteName;
                        return [4 /*yield*/, remote.fetch()];
                    case 3:
                        _a[_b] = _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, heads];
                }
            });
        });
    };
    Repository.prototype.pull = function (remote, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var newHead, baseHead, newTree, baseTree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.index.update()];
                    case 1:
                        _a.sent();
                        if (!this.remotes.exists(remote)) {
                            throw new Error("Remote '" + remote + "' does not exist");
                        }
                        if (!this.branches.exists(branch, { remote: remote })) {
                            throw new Error("Branch '" + remote + ':' + branch + "' does not exist");
                        }
                        if (this.index.unsnapshot.length) {
                            throw new Error('You have unsnapshot modifications: ' + this.index.unsnapshot);
                        }
                        if (this.index.modified.length) {
                            throw new Error('You have unstaged and unsnaphot modifications: ' + this.index.modified);
                        }
                        return [4 /*yield*/, this.fetch([remote])];
                    case 2:
                        _a.sent();
                        newHead = this.branches.head(branch, { remote: remote });
                        baseHead = this.head;
                        if (newHead === 'undefined') {
                            throw new Error("Branch '" + branch + ':' + remote + "' has no snapshot yet");
                        }
                        return [4 /*yield*/, this.node.get(newHead, 'tree')];
                    case 3:
                        newTree = _a.sent();
                        if (!(baseHead !== 'undefined')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.node.get(baseHead, 'tree')];
                    case 4:
                        baseTree = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, new tree_1.default({ path: '.', children: [] }).toIPLD()];
                    case 6:
                        baseTree = _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.updateWorkingDirectory(baseTree, newTree)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.index.reinitialize(newTree)];
                    case 9:
                        _a.sent();
                        this.currentBranch.head = newHead;
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unsnapshot, modified, untracked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.index.update()];
                    case 1:
                        _a.sent();
                        unsnapshot = this.index.unsnapshot;
                        modified = this.index.modified;
                        untracked = this.index.untracked;
                        return [2 /*return*/, { unsnapshot: unsnapshot, modified: modified, untracked: untracked }];
                }
            });
        });
    };
    Repository.prototype.log = function (branchName, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var branch, log;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.branches.load(branchName, opts)];
                    case 1:
                        branch = _a.sent();
                        return [4 /*yield*/, branch.log()];
                    case 2:
                        log = _a.sent();
                        return [2 /*return*/, log];
                }
            });
        });
    };
    Repository.prototype.fromCID = function (cid, path) {
        return __awaiter(this, void 0, void 0, function () {
            var data, index, object, _a, _b, _i, _c, parent_1, parentSnapshot, _d, _e, _f, child, _g, _h, link;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        path = path || '';
                        index = 0;
                        return [4 /*yield*/, this.node.get(cid, path || '')];
                    case 1:
                        object = _j.sent();
                        _a = object['@type'];
                        switch (_a) {
                            case 'snapshot': return [3 /*break*/, 2];
                            case 'tree': return [3 /*break*/, 8];
                            case 'file': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 14];
                    case 2:
                        data = {
                            author: object.author,
                            message: object.message,
                            parents: [],
                            timestamp: object.timestamp,
                            tree: undefined
                        };
                        _b = data;
                        return [4 /*yield*/, this.fromCID(cid, path + 'tree/')];
                    case 3:
                        _b.tree = _j.sent();
                        _i = 0, _c = object.parents;
                        _j.label = 4;
                    case 4:
                        if (!(_i < _c.length)) return [3 /*break*/, 7];
                        parent_1 = _c[_i];
                        return [4 /*yield*/, this.fromCID(cid, path + 'parents/' + index + '/')];
                    case 5:
                        parentSnapshot = _j.sent();
                        data.parents.push(parentSnapshot);
                        index++;
                        _j.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, new snapshot_1.default(data)];
                    case 8:
                        data = { path: object.path, children: {} };
                        delete object['@type'];
                        delete object.path;
                        _d = [];
                        for (_e in object)
                            _d.push(_e);
                        _f = 0;
                        _j.label = 9;
                    case 9:
                        if (!(_f < _d.length)) return [3 /*break*/, 12];
                        child = _d[_f];
                        if (!object.hasOwnProperty(child)) return [3 /*break*/, 11];
                        _g = data.children;
                        _h = child;
                        return [4 /*yield*/, this.fromCID(cid, path + child + '/')];
                    case 10:
                        _g[_h] = _j.sent();
                        _j.label = 11;
                    case 11:
                        _f++;
                        return [3 /*break*/, 9];
                    case 12: return [2 /*return*/, new tree_1.default(data)];
                    case 13:
                        link = new cids_1.default(object.link['/']);
                        return [2 /*return*/, new file_1.default({
                                link: link.toBaseEncodedString(),
                                path: object.path
                            })];
                    case 14: throw new TypeError('Unrecognized IPLD node');
                }
            });
        });
    };
    Repository.prototype.updateWorkingDirectory = function (baseTree, newTree) {
        return __awaiter(this, void 0, void 0, function () {
            var baseCID, newCID, _a, _b, _i, entry, baseEntryType, newEntryType, baseEntry, newEntry, _c, _d, _e, entry, path;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.node.cid(baseTree)];
                    case 1:
                        baseCID = _f.sent();
                        return [4 /*yield*/, this.node.cid(newTree)
                            // Delete meta properties to loop over tree's entries only
                        ];
                    case 2:
                        newCID = _f.sent();
                        // Delete meta properties to loop over tree's entries only
                        delete baseTree['@type'];
                        delete baseTree.path;
                        // Delete meta properties to loop over tree's entries only
                        delete newTree['@type'];
                        delete newTree.path;
                        _a = [];
                        for (_b in newTree)
                            _a.push(_b);
                        _i = 0;
                        _f.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 18];
                        entry = _a[_i];
                        if (!!baseTree[entry]) return [3 /*break*/, 5];
                        // entry existing in newTree but not in baseTree
                        // await this.node!.download(newTree[entry]['/'])
                        return [4 /*yield*/, this.node.download(newCID, entry)];
                    case 4:
                        // entry existing in newTree but not in baseTree
                        // await this.node!.download(newTree[entry]['/'])
                        _f.sent();
                        delete baseTree[entry];
                        return [3 /*break*/, 17];
                    case 5:
                        if (!(baseTree[entry]['/'] !== newTree[entry]['/'])) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.node.get(baseCID, entry + '/@type/')];
                    case 6:
                        baseEntryType = _f.sent();
                        return [4 /*yield*/, this.node.get(newCID, entry + '/@type/')];
                    case 7:
                        newEntryType = _f.sent();
                        if (!(baseEntryType !== newEntryType)) return [3 /*break*/, 9];
                        // entry type differs in baseTree and newTree
                        return [4 /*yield*/, this.node.download(newCID, entry)];
                    case 8:
                        // entry type differs in baseTree and newTree
                        _f.sent();
                        return [3 /*break*/, 16];
                    case 9:
                        if (!(baseEntryType === 'file')) return [3 /*break*/, 11];
                        // entry type is the same in baseTree and newTree
                        // entry is a file
                        return [4 /*yield*/, this.node.download(newCID, entry)];
                    case 10:
                        // entry type is the same in baseTree and newTree
                        // entry is a file
                        _f.sent();
                        return [3 /*break*/, 16];
                    case 11:
                        if (!(baseEntryType === 'tree')) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.node.get(baseCID, entry + '/')];
                    case 12: return [4 /*yield*/, _f.sent()];
                    case 13:
                        baseEntry = _f.sent();
                        return [4 /*yield*/, this.node.get(newCID, entry + '/')];
                    case 14:
                        newEntry = _f.sent();
                        return [4 /*yield*/, this.updateWorkingDirectory(baseEntry, newEntry)];
                    case 15:
                        _f.sent();
                        _f.label = 16;
                    case 16:
                        delete baseTree[entry];
                        _f.label = 17;
                    case 17:
                        _i++;
                        return [3 /*break*/, 3];
                    case 18:
                        _c = [];
                        for (_d in baseTree)
                            _c.push(_d);
                        _e = 0;
                        _f.label = 19;
                    case 19:
                        if (!(_e < _c.length)) return [3 /*break*/, 22];
                        entry = _c[_e];
                        if (!baseTree.hasOwnProperty(entry)) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.node.get(baseCID, entry + '/path/')];
                    case 20:
                        path = _f.sent();
                        utils.fs.rm(path_1.default.join(this.paths.root, path));
                        _f.label = 21;
                    case 21:
                        _e++;
                        return [3 /*break*/, 19];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.tree = function () {
        var index = this.index.current;
        var tree = new tree_1.default({ path: '.' });
        var staged = this.index.staged;
        staged.forEach(function (file, i) {
            if (index[file].stage === 'todelete') {
                delete index[file];
                staged.splice(i, 1);
            }
        });
        for (var _i = 0, staged_1 = staged; _i < staged_1.length; _i++) {
            var file = staged_1[_i];
            file.split(path_1.default.sep).reduce(function (parent, name) {
                var currentPath = path_1.default.join(parent.path, name);
                if (!parent.children[name]) {
                    if (index[currentPath]) {
                        parent.children[name] = new file_1.default({
                            link: index[currentPath].stage,
                            path: currentPath
                        });
                        index[currentPath].repo = index[currentPath].stage;
                    }
                    else {
                        parent.children[name] = new tree_1.default({ path: currentPath });
                    }
                }
                return parent.children[name];
            }, tree);
        }
        this.index.current = index;
        return tree;
    };
    /* tslint:disable:object-literal-sort-keys */
    Repository.paths = {
        root: '.',
        pando: '.pando',
        ipfs: '.pando/ipfs',
        index: '.pando/index',
        db: '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        branches: '.pando/branches',
        remotes: '.pando/remotes'
    };
    return Repository;
}());
exports.default = Repository;
//# sourceMappingURL=repository.js.map