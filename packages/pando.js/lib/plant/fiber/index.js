"use strict";
///<reference path="../../../node_modules/@types/levelup/index.d.ts"/>
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index/"));
var level_1 = __importDefault(require("level"));
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var _ = __importStar(require("lodash"));
var error_1 = __importDefault(require("../../error"));
var db = function (location, options) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                level_1.default(location, options, function (err, dbs) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(dbs);
                    }
                });
            })];
    });
}); };
var Fiber = /** @class */ (function () {
    function Fiber(plant, uuid) {
        this.plant = plant;
        this.uuid = uuid;
        this.paths = {
            root: Fiber.paths(plant, uuid, 'root'),
            index: Fiber.paths(plant, uuid, 'index'),
            snapshots: Fiber.paths(plant, uuid, 'snapshots'),
            stash: Fiber.paths(plant, uuid, 'stash')
        };
    }
    Fiber.paths = function (plant, uuid, path) {
        switch (path) {
            case "root":
                return path_1.default.join(plant.paths.fibers, uuid);
            case "index":
                return path_1.default.join(plant.paths.fibers, uuid, 'index');
            case "snapshots":
                return path_1.default.join(plant.paths.fibers, uuid, 'snapshots');
            case "stash":
                return path_1.default.join(plant.paths.fibers, uuid, 'stash');
            default:
                throw new Error('Unknown path');
        }
    };
    Fiber.exists = function (plant, uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, one, two, three;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fs_extra_1.default.pathExists(Fiber.paths(plant, uuid, 'root')),
                            fs_extra_1.default.pathExists(Fiber.paths(plant, uuid, 'index')),
                            fs_extra_1.default.pathExists(Fiber.paths(plant, uuid, 'snapshots')),
                            fs_extra_1.default.pathExists(Fiber.paths(plant, uuid, 'stash'))
                        ])];
                    case 1:
                        _a = _b.sent(), one = _a[0], two = _a[1], three = _a[2];
                        return [2 /*return*/, one && two && three];
                }
            });
        });
    };
    // public static async create(plant: Plant, { open = false }: { open?: boolean} = {}): Promise<Fiber> {
    //     const fiber = new Fiber(plant, uuidv1())
    //
    //     await fiber.initialize({ mkdir: true })
    //
    //     if (!open) {
    //         await fiber._close()
    //     }
    //
    //     return fiber
    // }
    Fiber.load = function (plant, uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var fiber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Fiber.exists(plant, uuid)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new error_1.default('E_FIBER_NOT_FOUND', uuid);
                        }
                        fiber = new Fiber(plant, uuid);
                        return [2 /*return*/, fiber.initialize()];
                }
            });
        });
    };
    Fiber.prototype.initialize = function (_a) {
        var _b = (_a === void 0 ? {} : _a).mkdir, mkdir = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (mkdir) {
                            fs_extra_1.default.ensureDirSync(this.paths.stash);
                        }
                        return [4 /*yield*/, Promise.all([
                                index_1.default.for(this),
                                db(this.paths.snapshots, { valueEncoding: 'json' })
                            ])];
                    case 1:
                        _c = _d.sent(), this.index = _c[0], this.snapshots = _c[1];
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Fiber.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.index.status()];
            });
        });
    };
    Fiber.prototype.snapshot = function (message) {
        if (message === void 0) { message = 'n/a'; }
        return __awaiter(this, void 0, void 0, function () {
            var id, tree, snapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._length()];
                    case 1:
                        id = _a.sent();
                        return [4 /*yield*/, this.index.snapshot()];
                    case 2:
                        tree = _a.sent();
                        snapshot = { id: id, timestamp: new Date(Date.now()).toISOString(), message: message, tree: tree };
                        return [4 /*yield*/, this.snapshots.put(id, snapshot)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, snapshot];
                }
            });
        });
    };
    Fiber.prototype.revert = function (id, paths) {
        if (paths === void 0) { paths = ['']; }
        return __awaiter(this, void 0, void 0, function () {
            var snapshot, promises, files, _i, paths_1, path, tree, _a, tree_1, file, _loop_1, this_1, _b, files_1, file;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.snapshots.get(id)];
                    case 1:
                        snapshot = _c.sent();
                        promises = [];
                        files = [];
                        _i = 0, paths_1 = paths;
                        _c.label = 2;
                    case 2:
                        if (!(_i < paths_1.length)) return [3 /*break*/, 5];
                        path = paths_1[_i];
                        path = path_1.default.relative(this.plant.paths.root, path);
                        return [4 /*yield*/, this.plant.node.files.get(snapshot.tree + '/' + path)];
                    case 3:
                        tree = _c.sent();
                        console.log(tree);
                        if (tree.length <= 0) {
                            throw new error_1.default('E_ENTRY_NOT_FOUND_IN_SNAPSHOT', path, id);
                        }
                        else {
                            for (_a = 0, tree_1 = tree; _a < tree_1.length; _a++) {
                                file = tree_1[_a];
                                if (file.type === 'file') {
                                    files.push({ destination: path.length > 0 ? path_1.default.join(path_1.default.dirname(path), file.path) : file.path.split(path_1.default.sep).slice(1).join(path_1.default.sep), content: file.content });
                                }
                            }
                        }
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        files = _.uniqBy(files, 'destination');
                        return [4 /*yield*/, this.snapshot('Automatic snapshot before reverting to snapshot #' + id)];
                    case 6:
                        _c.sent();
                        _loop_1 = function (file) {
                            promises.push(fs_extra_1.default.ensureFile(path_1.default.join(this_1.plant.paths.root, file.destination)).then(function () { return fs_extra_1.default.writeFile(path_1.default.join(_this.plant.paths.root, file.destination), file.content); }));
                        };
                        this_1 = this;
                        for (_b = 0, files_1 = files; _b < files_1.length; _b++) {
                            file = files_1[_b];
                            _loop_1(file);
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 7:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Fiber.prototype.log = function (_a) {
        var _b = (_a === void 0 ? {} : _a).limit, limit = _b === void 0 ? 10 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var snapshots;
            var _this = this;
            return __generator(this, function (_c) {
                snapshots = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.snapshots
                            .createReadStream({ reverse: true, limit: limit, keys: false })
                            .on('data', function (snapshot) { snapshots.push(snapshot); })
                            .on('error', function (err) { reject(err); })
                            .on('end', function () { resolve(snapshots); });
                    })];
            });
        });
    };
    Fiber.prototype._open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ops;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ops = [];
                        if (this.snapshots.isClosed())
                            ops.push(this.snapshots.open());
                        if (this.index.db.isClosed())
                            ops.push(this.index.db.open());
                        return [4 /*yield*/, Promise.all(ops)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Fiber.prototype._close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ops;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ops = [];
                        if (this.snapshots.isOpen())
                            ops.push(this.snapshots.close());
                        if (this.index.db.isOpen())
                            ops.push(this.index.db.close());
                        return [4 /*yield*/, Promise.all(ops)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Fiber.prototype._length = function () {
        return __awaiter(this, void 0, void 0, function () {
            var length;
            var _this = this;
            return __generator(this, function (_a) {
                length = 0;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            this.snapshots
                                .createReadStream({ reverse: true, limit: 1, values: false })
                                .on('data', function (key) {
                                length = parseInt(key) + 1;
                            })
                                .on('error', function (err) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    reject(err);
                                    return [2 /*return*/];
                                });
                            }); })
                                .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    resolve(length);
                                    return [2 /*return*/];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Fiber;
}());
exports.default = Fiber;
//# sourceMappingURL=index.js.map