"use strict";
///<reference path="../node_modules/@types/levelup/index.d.ts"/>
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
var ipfs_1 = __importDefault(require("ipfs"));
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
    function Index(repository, node, db) {
        this.repository = repository;
        this.node = node;
        this.index = db;
    }
    Index.create = function (repository) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var node = new ipfs_1.default({ repo: repository.paths.ipfs, start: false });
                        node.on('ready', function () {
                            level_1.default(repository.paths.index, { valueEncoding: 'json' }, function (err, db) {
                                if (err)
                                    reject(err);
                                resolve(new Index(repository, node, db));
                            });
                        });
                        node.on('error', function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    // public ignore(item: string): boolean {
    //     console.log(item)
    //     if (item.indexOf('.pando') >= 0) {
    //         return false
    //     } else {
    //         return true
    //     }
    // }
    // const filter = item => {
    //     return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
    // }
    Index.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, index, updates;
            var _this = this;
            return __generator(this, function (_a) {
                files = {};
                index = {};
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
                            var readStream = _this.index.createReadStream();
                            var writeStream = new stream_1.default.Writable({
                                objectMode: true,
                                write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                    var data, result, cid;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!files[file.key]) return [3 /*break*/, 4];
                                                if (!(new Date(file.value.mtime) < files[file.key].mtime)) return [3 /*break*/, 2];
                                                console.log('Modified file: ' + file.key);
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
                                                return [3 /*break*/, 3];
                                            case 2:
                                                console.log('Unmodified file: ' + file.key);
                                                index[file.key] = file.value;
                                                _a.label = 3;
                                            case 3: return [3 /*break*/, 5];
                                            case 4:
                                                console.log('Deleted file: ' + file.key);
                                                index[file.key] = {
                                                    mtime: new Date(Date.now()).toISOString(),
                                                    snapshot: file.value.snapshot,
                                                    stage: file.value.stage,
                                                    wdir: 'null'
                                                };
                                                updates.push({ type: 'put', key: file.key, value: index[file.key] });
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
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4: return [4 /*yield*/, this.index.batch(updates)];
                                        case 5:
                                            _c.sent();
                                            resolve(index);
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
    Index.prototype.stage = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var index, paths, updates, _i, paths_1, path, entry, ls, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.update()];
                    case 1:
                        index = _a.sent();
                        paths = this.extract(files, index);
                        updates = [];
                        console.log(paths);
                        _i = 0, paths_1 = paths;
                        _a.label = 2;
                    case 2:
                        if (!(_i < paths_1.length)) return [3 /*break*/, 9];
                        path = paths_1[_i];
                        return [4 /*yield*/, this.index.get(path)];
                    case 3:
                        entry = _a.sent();
                        if (!(entry.wdir !== entry.stage)) return [3 /*break*/, 8];
                        if (!(entry.wdir !== 'null')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.node.files.write('/' + path, fs_extra_1.default.readFileSync(path_1.default.join(this.repository.paths.root, path)), { create: true, parents: true })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: // entry does not exists in wdir
                    return [4 /*yield*/, this.node.files.rm('/' + path)
                        // const dir = path.dirname('/foo/bar/baz/asdf/quux');
                        // empty directory
                    ];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        index[path].stage = index[path].wdir;
                        updates.push({ type: 'put', key: path, value: index[path] });
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, this.index.batch(updates)];
                    case 10:
                        _a.sent();
                        console.log('MFS');
                        return [4 /*yield*/, this.node.files.ls()];
                    case 11:
                        ls = _a.sent();
                        return [4 /*yield*/, this.node.files.stat('/', { hash: true })];
                    case 12:
                        hash = _a.sent();
                        console.log(hash);
                        return [2 /*return*/, index
                            // for (let path of files) {
                            //     path = npath.relative(this.repository.paths.root, path)
                            //
                            //     // fs.stat(npath.join(this.repository.paths.root, path), (err, stats) => {
                            //     //
                            //     // }
                            //     //
                            //     // fs.access(npath.join(this.repository.paths.root, path), fs.constants.F_OK, (err) => {
                            //     //     if(err) { // path does not exist in wdir
                            //     //
                            //     //     } else { // path exists in wdir
                            //     //
                            //     //     }
                            //     // })
                            // }
                            // const readStream  = this.index.createReadStream()
                            // const writeStream = new stream.Writable({
                            //     objectMode: true,
                            //     write: async (file, encoding, next) => {
                            //
                            //         if (file.)
                            //
                            //         if (files.indexOf(file.key)]) { // file still exists in wdir
                            //             if (new Date(file.value.mtime) < files[file.key].mtime) { // file has been modified since last index's update
                            //                 console.log('Modified file: ' + file.key)
                            //
                            //                 const data = [{ path: file.key, content: fs.readFileSync(npath.join(this.repository.paths.root, file.key)) }]
                            //                 const result = await this.node.files.add(data, { onlyHash: true })
                            //                 const cid = result[0].hash
                            //
                            //                 index[file.key] = {
                            //                     mtime: files[file.key].mtime.toISOString(),
                            //                     snapshot: file.value.snapshot,
                            //                     stage: file.value.stage,
                            //                     wdir: cid
                            //                 }
                            //                 updates.push({ type: 'put', key: file.key, value: index[file.key] })
                            //             } else { // file has not been modified since last index's update
                            //                 console.log('Unmodified file: ' + file.key)
                            //                 index[file.key] = file.value
                            //             }
                            //         } else { // file does not exist in wdir anymore
                            //             console.log('Deleted file: ' + file.key)
                            //             index[file.key] = {
                            //                 mtime: new Date(Date.now()).toISOString(),
                            //                 snapshot: file.value.snapshot,
                            //                 stage: file.value.stage,
                            //                 wdir: 'null'
                            //             }
                            //             updates.push({ type: 'put', key: file.key, value: index[file.key] })
                            //         }
                            //         delete files[file.key]
                            //         next();
                            //     }
                            // });
                        ];
                }
            });
        });
    };
    Index.prototype.extract = function (files, index) {
        var _this = this;
        files = files.map(function (path) {
            path = path_1.default.relative(_this.repository.paths.root, path);
            return _.filter(Object.keys(index), function (entry) {
                return entry.indexOf(path) === 0;
            });
        });
        return _.uniq(_.flattenDeep(files));
    };
    return Index;
}());
exports.default = Index;
//# sourceMappingURL=index.js.map