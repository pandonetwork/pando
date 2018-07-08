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
var cids_1 = __importDefault(require("cids"));
var fs_1 = __importDefault(require("fs"));
var klaw_sync_1 = __importDefault(require("klaw-sync"));
var lodash_1 = __importDefault(require("lodash"));
var path_1 = __importDefault(require("path"));
var Index = /** @class */ (function () {
    function Index(repository) {
        this.repository = repository;
    }
    Index.new = function (repository) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Index(repository)];
            });
        });
    };
    Index.load = function (repository) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Index(repository)];
            });
        });
    };
    Object.defineProperty(Index.prototype, "path", {
        get: function () {
            return this.repository.paths.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "current", {
        get: function () {
            return utils.yaml.read(this.path);
        },
        set: function (index) {
            utils.yaml.write(this.path, index);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "unsnapshot", {
        /**
         * Returns staged but unsnaphot files
         *
         * @returns {string[]}
         */
        get: function () {
            var current = this.current;
            var unsnaphot = [];
            for (var entry in current) {
                if (current[entry].repo !== current[entry].stage) {
                    unsnaphot.push(entry);
                }
            }
            return unsnaphot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "untracked", {
        get: function () {
            var current = this.current;
            var untracked = [];
            for (var entry in current) {
                if (current[entry].stage === 'null') {
                    untracked.push(entry);
                }
            }
            return untracked;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "staged", {
        /**
         * Returns once staged files
         *
         * @returns {string[]}
         */
        get: function () {
            var current = this.current;
            var staged = [];
            for (var entry in current) {
                if (current[entry].stage !== 'null') {
                    staged.push(entry);
                }
            }
            return staged;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "modified", {
        /**
         * Returns modified once staged files
         *
         * @returns {string[]}
         */
        get: function () {
            var current = this.current;
            var modified = [];
            for (var entry in current) {
                if (current[entry].stage !== 'null' &&
                    current[entry].stage !== 'todelete' &&
                    current[entry].wdir !== current[entry].stage) {
                    modified.push(entry);
                }
            }
            return modified;
        },
        enumerable: true,
        configurable: true
    });
    Index.prototype.reinitialize = function (tree, index) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, entry, node, cid;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        index = index || {};
                        delete tree['@type'];
                        delete tree.path;
                        _a = [];
                        for (_b in tree)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        entry = _a[_i];
                        if (!tree.hasOwnProperty(entry)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.repository.node.get(tree[entry]['/'])];
                    case 2:
                        node = _c.sent();
                        if (!(node['@type'] === 'tree')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reinitialize(node, index)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (node['@type'] === 'file') {
                            cid = new cids_1.default(node.link['/']).toBaseEncodedString();
                            index[node.path] = {
                                mtime: new Date(Date.now()),
                                repo: cid,
                                stage: cid,
                                wdir: cid
                            };
                        }
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.current = index;
                        return [2 /*return*/, index];
                }
            });
        });
    };
    Index.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var index, files, filter, listing, _i, listing_1, item, relativePath, newFiles, _a, _b, _c, relativePath, cid, _d, _e, _f, relativePath, cid;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        index = this.current;
                        files = {};
                        filter = function (item) {
                            return (item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0);
                        };
                        listing = klaw_sync_1.default(this.repository.paths.root, { nodir: true, filter: filter });
                        for (_i = 0, listing_1 = listing; _i < listing_1.length; _i++) {
                            item = listing_1[_i];
                            relativePath = path_1.default.relative(this.repository.paths.root, item.path);
                            files[relativePath] = { mtime: new Date(item.stats.mtime) };
                        }
                        newFiles = Object.assign(files);
                        _a = [];
                        for (_b in index)
                            _a.push(_b);
                        _c = 0;
                        _g.label = 1;
                    case 1:
                        if (!(_c < _a.length)) return [3 /*break*/, 7];
                        relativePath = _a[_c];
                        if (!index.hasOwnProperty(relativePath)) return [3 /*break*/, 6];
                        if (!files[relativePath]) return [3 /*break*/, 4];
                        if (!(new Date(index[relativePath].mtime) <=
                            new Date(files[relativePath].mtime))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.repository.node.cid(path_1.default.join(this.repository.paths.root, relativePath), { file: true })];
                    case 2:
                        cid = _g.sent();
                        index[relativePath].mtime = files[relativePath].mtime;
                        index[relativePath].wdir = cid;
                        _g.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        // files at _path has been deleted
                        index[relativePath].mtime = new Date(Date.now());
                        index[relativePath].wdir = 'null';
                        _g.label = 5;
                    case 5:
                        delete newFiles[relativePath];
                        _g.label = 6;
                    case 6:
                        _c++;
                        return [3 /*break*/, 1];
                    case 7:
                        _d = [];
                        for (_e in newFiles)
                            _d.push(_e);
                        _f = 0;
                        _g.label = 8;
                    case 8:
                        if (!(_f < _d.length)) return [3 /*break*/, 11];
                        relativePath = _d[_f];
                        if (!newFiles.hasOwnProperty(relativePath)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.repository.node.cid(path_1.default.join(this.repository.paths.root, relativePath), { file: true })];
                    case 9:
                        cid = _g.sent();
                        index[relativePath] = {
                            mtime: files[relativePath].mtime,
                            repo: 'null',
                            stage: 'null',
                            wdir: cid
                        };
                        _g.label = 10;
                    case 10:
                        _f++;
                        return [3 /*break*/, 8];
                    case 11:
                        // for (let _path in index) { // remove deleted files from index
                        //   if (index[_path].wdir === 'null') {
                        //
                        //   }
                        // }
                        this.current = index;
                        return [2 /*return*/, index];
                }
            });
        });
    };
    Index.prototype.stage = function (filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var index, _loop_1, this_1, _i, filePaths_1, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.update()];
                    case 1:
                        index = _a.sent();
                        _loop_1 = function (filePath) {
                            var relativePath, filter, listing, _i, listing_2, item, relativeItemPath, children, _a, children_1, child, cid, filter, children, _b, children_2, child;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        filePath = path_1.default.normalize(filePath);
                                        relativePath = path_1.default.relative(this_1.repository.paths.root, filePath);
                                        if (!utils.fs.exists(filePath)) return [3 /*break*/, 4];
                                        if (!fs_1.default.lstatSync(filePath).isDirectory()) return [3 /*break*/, 1];
                                        filter = function (item) {
                                            return (item.path.indexOf('.pando') < 0 &&
                                                item.path.indexOf('node_modules') < 0);
                                        };
                                        listing = klaw_sync_1.default(filePath, { nodir: true, filter: filter });
                                        for (_i = 0, listing_2 = listing; _i < listing_2.length; _i++) {
                                            item = listing_2[_i];
                                            relativeItemPath = path_1.default.relative(this_1.repository.paths.root, item.path);
                                            filePaths.push(relativeItemPath);
                                        }
                                        children = lodash_1.default.filter(Object.keys(index), function (entry) {
                                            return entry.indexOf(relativePath) === 0;
                                        });
                                        if (children.length) {
                                            for (_a = 0, children_1 = children; _a < children_1.length; _a++) {
                                                child = children_1[_a];
                                                filePaths.push(child);
                                            }
                                        }
                                        return [3 /*break*/, 3];
                                    case 1: return [4 /*yield*/, this_1.repository.node.upload(filePath)];
                                    case 2:
                                        cid = _c.sent();
                                        index[relativePath].stage = cid;
                                        _c.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        // file / dir does not exist in cwd
                                        if (index[relativePath]) {
                                            // Old file to delete
                                            index[relativePath].wdir = 'null';
                                            index[relativePath].stage = 'todelete';
                                        }
                                        else {
                                            filter = function (item) {
                                                return (item.path.indexOf('.pando') < 0 &&
                                                    item.path.indexOf('node_modules') < 0);
                                            };
                                            children = lodash_1.default.filter(Object.keys(index), function (entry) {
                                                return entry.indexOf(relativePath) === 0;
                                            });
                                            if (children.length) {
                                                for (_b = 0, children_2 = children; _b < children_2.length; _b++) {
                                                    child = children_2[_b];
                                                    filePaths.push(child);
                                                }
                                            }
                                            else {
                                                throw new Error(filePath +
                                                    ' does not exist neither in current working directory nor in index');
                                            }
                                        }
                                        _c.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, filePaths_1 = filePaths;
                        _a.label = 2;
                    case 2:
                        if (!(_i < filePaths_1.length)) return [3 /*break*/, 5];
                        filePath = filePaths_1[_i];
                        return [5 /*yield**/, _loop_1(filePath)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.current = index;
                        return [2 /*return*/, index];
                }
            });
        });
    };
    return Index;
}());
exports.default = Index;
//# sourceMappingURL=index.js.map