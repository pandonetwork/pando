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
var fs_extra_1 = __importDefault(require("fs-extra"));
var level_1 = __importDefault(require("level"));
var path_1 = __importDefault(require("path"));
var klaw_1 = __importDefault(require("klaw"));
var through2_1 = __importDefault(require("through2"));
var stream_1 = __importDefault(require("stream"));
var _ = __importStar(require("lodash"));
var ignore = through2_1.default.obj(function (item, enc, next) {
    // console.log(item.path)
    // console.log('IGNORE')
    if (!item.stats.isDirectory() && item.path.indexOf('.pando') < 0) {
        this.push(item);
    }
    next();
});
var Index = /** @class */ (function () {
    function Index(fiber) {
        this.fiber = fiber;
        this.db = level_1.default(fiber.paths.index, { valueEncoding: 'json' });
    }
    Object.defineProperty(Index.prototype, "repository", {
        get: function () {
            return this.fiber.repository;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "node", {
        get: function () {
            return this.repository.node;
        },
        enumerable: true,
        configurable: true
    });
    Index.prototype.current = function () {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            var _this = this;
            return __generator(this, function (_a) {
                index = {};
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var readStream = _this.db.createReadStream();
                        var writeStream = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    index[file.key] = file.value;
                                    next();
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        writeStream
                            .on('finish', function () { resolve(index); })
                            .on('error', function (err) { reject(err); });
                        readStream
                            .pipe(writeStream)
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    Index.prototype.track = function (paths) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, index, untracked, modified, deleted, _i, paths_1, path, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.status()];
                    case 1:
                        _a = _b.sent(), index = _a.index, untracked = _a.untracked, modified = _a.modified, deleted = _a.deleted;
                        paths = this.extract(paths, index);
                        _i = 0, paths_1 = paths;
                        _b.label = 2;
                    case 2:
                        if (!(_i < paths_1.length)) return [3 /*break*/, 6];
                        path = paths_1[_i];
                        return [4 /*yield*/, this.db.get(path)];
                    case 3:
                        value = _b.sent();
                        value.tracked = true;
                        return [4 /*yield*/, this.db.put(path, value)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Index.prototype.untrack = function (paths) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, index, untracked, modified, deleted, _i, paths_2, path, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.status()];
                    case 1:
                        _a = _b.sent(), index = _a.index, untracked = _a.untracked, modified = _a.modified, deleted = _a.deleted;
                        paths = this.extract(paths, index);
                        _i = 0, paths_2 = paths;
                        _b.label = 2;
                    case 2:
                        if (!(_i < paths_2.length)) return [3 /*break*/, 6];
                        path = paths_2[_i];
                        return [4 /*yield*/, this.db.get(path)];
                    case 3:
                        value = _b.sent();
                        value.tracked = false;
                        return [4 /*yield*/, this.db.put(path, value)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Index.prototype._ls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files;
            var _this = this;
            return __generator(this, function (_a) {
                files = {};
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        klaw_1.default(_this.repository.paths.root)
                            .pipe(through2_1.default.obj(function (item, enc, next) {
                            if (item.path.indexOf('.pando') >= 0) {
                                next();
                            }
                            else {
                                this.push(item);
                                next();
                            }
                        }))
                            .pipe(through2_1.default.obj(function (item, enc, next) {
                            if (item.stats.isDirectory()) {
                                next();
                            }
                            else {
                                this.push(item);
                                next();
                            }
                        }))
                            .on('data', function (file) {
                            files[path_1.default.relative(_this.repository.paths.root, file.path)] = { mtime: file.stats.mtime };
                        })
                            .on('end', function () { resolve(files); });
                    })];
            });
        });
    };
    Index.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, index, untracked, unsnapshot, modified, deleted, updates;
            var _this = this;
            return __generator(this, function (_a) {
                files = {};
                index = {};
                untracked = [];
                unsnapshot = [];
                modified = [];
                deleted = [];
                updates = [];
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var readStream, writeStream;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this._ls()];
                                case 1:
                                    files = _a.sent();
                                    readStream = this.db.createReadStream();
                                    writeStream = new stream_1.default.Writable({
                                        objectMode: true,
                                        write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                            var cid;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        // if (file.value.tracked) { // file is tracked
                                                        if (file.value.tracked && file.snapshot === 'null') {
                                                            unsnapshot.push(file.key);
                                                        }
                                                        if (!files[file.key]) return [3 /*break*/, 4];
                                                        if (!(new Date(file.value.mtime) < files[file.key].mtime)) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, this.cid(file.key)];
                                                    case 1:
                                                        cid = _a.sent();
                                                        index[file.key] = {
                                                            mtime: files[file.key].mtime.toISOString(),
                                                            tracked: file.value.tracked,
                                                            wdir: cid,
                                                            snapshot: file.value.snapshot
                                                        };
                                                        updates.push({ type: 'put', key: file.key, value: index[file.key] });
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        index[file.key] = file.value;
                                                        _a.label = 3;
                                                    case 3:
                                                        if (file.value.tracked && index[file.key].wdir !== index[file.key].snapshot) {
                                                            modified.push(file.key);
                                                        }
                                                        if (!file.value.tracked) {
                                                            untracked.push(file.key);
                                                        }
                                                        return [3 /*break*/, 5];
                                                    case 4:
                                                        if (file.value.snapshot === 'null') {
                                                            delete index[file.key];
                                                            updates.push({ type: 'del', key: file.key });
                                                        }
                                                        else {
                                                            index[file.key] = {
                                                                mtime: new Date(Date.now()).toISOString(),
                                                                tracked: file.value.tracked,
                                                                wdir: 'null',
                                                                snapshot: file.value.snapshot
                                                            };
                                                            updates.push({ type: 'put', key: file.key, value: index[file.key] });
                                                            if (!file.value.tracked) {
                                                                untracked.push(file.key);
                                                            }
                                                        }
                                                        if (file.value.tracked && file.value.snapshot !== 'null') {
                                                            deleted.push(file.key);
                                                        }
                                                        _a.label = 5;
                                                    case 5:
                                                        // } else { // file is untracked
                                                        // untracked.push(file.key)
                                                        // }
                                                        delete files[file.key];
                                                        next();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }
                                    });
                                    writeStream
                                        .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                                        var _a, _b, _i, path, cid;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    _a = [];
                                                    for (_b in files)
                                                        _a.push(_b);
                                                    _i = 0;
                                                    _c.label = 1;
                                                case 1:
                                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                                    path = _a[_i];
                                                    return [4 /*yield*/, this.cid(path)];
                                                case 2:
                                                    cid = _c.sent();
                                                    index[path] = {
                                                        mtime: files[path].mtime.toISOString(),
                                                        tracked: false,
                                                        wdir: cid,
                                                        snapshot: 'null'
                                                    };
                                                    updates.push({ type: 'put', key: path, value: index[path] });
                                                    untracked.push(path);
                                                    _c.label = 3;
                                                case 3:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 4: return [4 /*yield*/, this.db.batch(updates)];
                                                case 5:
                                                    _c.sent();
                                                    resolve({ index: index, untracked: untracked, unsnapshot: unsnapshot, modified: modified, deleted: deleted });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })
                                        .on('error', function (err) {
                                        reject(err);
                                    });
                                    readStream
                                        .pipe(writeStream)
                                        .on('error', function (err) {
                                        reject(err);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Index.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, index, untracked, modified, deleted, updates;
            var _this = this;
            return __generator(this, function (_a) {
                files = {};
                index = {};
                untracked = [];
                modified = [];
                deleted = [];
                updates = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        klaw_1.default(_this.repository.paths.root)
                            .pipe(through2_1.default.obj(function (item, enc, next) {
                            if (item.path.indexOf('.pando') >= 0) {
                                next();
                            }
                            else {
                                this.push(item);
                                next();
                            }
                        }))
                            .pipe(through2_1.default.obj(function (item, enc, next) {
                            if (item.stats.isDirectory()) {
                                next();
                            }
                            else {
                                this.push(item);
                                next();
                            }
                        }))
                            .on('data', function (file) {
                            files[path_1.default.relative(_this.repository.paths.root, file.path)] = { mtime: file.stats.mtime };
                        })
                            .on('end', function () {
                            var readStream = _this.db.createReadStream();
                            var writeStream = new stream_1.default.Writable({
                                objectMode: true,
                                write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                    var data, result, cid;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!files[file.key]) return [3 /*break*/, 4];
                                                if (!(new Date(file.value.mtime) < files[file.key].mtime)) return [3 /*break*/, 2];
                                                data = [{ path: file.key, content: fs_extra_1.default.readFileSync(path_1.default.join(this.repository.paths.root, file.key)) }];
                                                return [4 /*yield*/, this.node.files.add(data, { onlyHash: true })];
                                            case 1:
                                                result = _a.sent();
                                                cid = result[0].hash;
                                                index[file.key] = {
                                                    mtime: files[file.key].mtime.toISOString(),
                                                    snapshot: file.value.snapshot,
                                                    stage: file.value.stage,
                                                    wdir: cid
                                                };
                                                updates.push({ type: 'put', key: file.key, value: index[file.key] });
                                                if (index[file.key].stage !== 'null') {
                                                    modified.push(file.key);
                                                }
                                                else {
                                                    untracked.push(file.key);
                                                }
                                                return [3 /*break*/, 3];
                                            case 2:
                                                index[file.key] = file.value;
                                                if (index[file.key].stage === 'null') {
                                                    untracked.push(file.key);
                                                }
                                                _a.label = 3;
                                            case 3: return [3 /*break*/, 5];
                                            case 4:
                                                index[file.key] = {
                                                    mtime: new Date(Date.now()).toISOString(),
                                                    snapshot: file.value.snapshot,
                                                    stage: file.value.stage,
                                                    wdir: 'null'
                                                };
                                                updates.push({ type: 'put', key: file.key, value: index[file.key] });
                                                deleted.push(file.key);
                                                _a.label = 5;
                                            case 5:
                                                delete files[file.key];
                                                next();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }
                            });
                            writeStream
                                .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _i, path, data, result, cid;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [];
                                            for (_b in files)
                                                _a.push(_b);
                                            _i = 0;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                                            path = _a[_i];
                                            if (!files.hasOwnProperty(path)) return [3 /*break*/, 3];
                                            data = [{ path: path, content: fs_extra_1.default.readFileSync(path_1.default.join(this.repository.paths.root, path)) }];
                                            return [4 /*yield*/, this.node.files.add(data, { onlyHash: true })];
                                        case 2:
                                            result = _c.sent();
                                            cid = result[0].hash;
                                            index[path] = {
                                                mtime: files[path].mtime.toISOString(),
                                                snapshot: 'null',
                                                stage: 'null',
                                                wdir: cid
                                            };
                                            updates.push({ type: 'put', key: path, value: index[path] });
                                            untracked.push(path);
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4: return [4 /*yield*/, this.db.batch(updates)];
                                        case 5:
                                            _c.sent();
                                            resolve({ index: index, untracked: untracked, modified: modified, deleted: deleted });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .on('error', function (err) {
                                reject(err);
                            });
                            readStream
                                .pipe(writeStream)
                                .on('error', function (err) {
                                reject(err);
                            });
                        });
                    })];
            });
        });
    };
    Index.prototype.cid = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var data, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = [{ path: path, content: fs_extra_1.default.readFileSync(path_1.default.join(this.repository.paths.root, path)) }];
                        return [4 /*yield*/, this.node.files.add(data, { onlyHash: true })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0].hash];
                }
            });
        });
    };
    Index.prototype.snapshot = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, index, untracked, modified, deleted, promises, updates, _i, modified_1, path;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.status()];
                    case 1:
                        _a = _b.sent(), index = _a.index, untracked = _a.untracked, modified = _a.modified, deleted = _a.deleted;
                        promises = [];
                        updates = [];
                        for (_i = 0, modified_1 = modified; _i < modified_1.length; _i++) {
                            path = modified_1[_i];
                            index[path].snapshot = index[path].wdir;
                            updates.push({ type: 'put', key: path, value: index[path] });
                            promises.push(this.node.files.write('/' + path, fs_extra_1.default.readFileSync(path_1.default.join(this.repository.paths.root, path)), { create: true, parents: true }));
                        }
                        // for (let path in modified) {
                        //     const entry = await this.db.get(path)
                        //
                        //     if (entry.tracked && entry.wdir !== entry.snapshot) { // entry has been modified since last stage
                        //         if (entry.wdir !== 'null') { // entry exists in wdir
                        //             await this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true })
                        //         } else { // entry does not exists in wdir
                        //             await this.node.files.rm('/' + path)
                        //             await this.clean(path)
                        //         }
                        //
                        //         index[path].stage = index[path].wdir
                        //         updates.push({ type: 'put', key: path, value: index[path] })
                        //     }
                        // }
                        promises.push(this.db.batch(updates));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, index];
                }
            });
        });
    };
    Index.prototype.clean = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var dir, stat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dir = path_1.default.dirname(path);
                        _a.label = 1;
                    case 1:
                        if (!(dir !== '.')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.node.files.stat('/' + dir)];
                    case 2:
                        stat = _a.sent();
                        if (!(stat.type === 'directory' && stat.blocks === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.node.files.rm('/' + dir, { recursive: true })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        dir = path_1.default.dirname(dir);
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Index.prototype.extract = function (paths, index) {
        var _this = this;
        paths = paths.map(function (path) {
            path = path_1.default.relative(_this.repository.paths.root, path);
            return _.filter(Object.keys(index), function (entry) {
                return entry.indexOf(path) === 0;
            });
        });
        return _.uniq(_.flattenDeep(paths));
    };
    return Index;
}());
exports.default = Index;
//# sourceMappingURL=index.js.map