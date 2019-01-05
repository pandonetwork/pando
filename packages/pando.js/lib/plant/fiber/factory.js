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
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __importDefault(require("./"));
var level_1 = __importDefault(require("level"));
var path_1 = __importDefault(require("path"));
var klaw_1 = __importDefault(require("klaw"));
var through2_1 = __importDefault(require("through2"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var stream_1 = __importDefault(require("stream"));
var v1_1 = __importDefault(require("uuid/v1"));
var error_1 = __importDefault(require("../../error"));
var FiberFactory = /** @class */ (function () {
    function FiberFactory(plant) {
        this.plant = plant;
        this.db = level_1.default(path_1.default.join(plant.paths.fibers, 'db'), { valueEncoding: 'json' });
    }
    FiberFactory.prototype.exists = function (nameOrUuid, _a) {
        var _b = (_a === void 0 ? {} : _a).uuid, uuid = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var uuid_, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!uuid) return [3 /*break*/, 1];
                        _c = nameOrUuid;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.uuid(nameOrUuid)];
                    case 2:
                        _c = _d.sent();
                        _d.label = 3;
                    case 3:
                        uuid_ = _c;
                        if (typeof uuid_ === 'undefined') {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.db.get(uuid_, function (err, value) {
                                    if (err) {
                                        if (err.notFound) {
                                            resolve(false);
                                        }
                                        else {
                                            reject(err);
                                        }
                                    }
                                    else {
                                        resolve(true);
                                    }
                                });
                            })];
                }
            });
        });
    };
    FiberFactory.prototype.create = function (name, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.fork, fork = _c === void 0 ? true : _c, _d = _b.open, open = _d === void 0 ? false : _d;
        return __awaiter(this, void 0, void 0, function () {
            var fiber, current;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.exists(name)];
                    case 1:
                        // Do not return if the load / open options is disabled otherwise it's a misunderstanding for people
                        if (_e.sent()) {
                            throw new error_1.default('E_FIBER_NAME_ALREADY_EXISTS', name);
                        }
                        fiber = new _1.default(this.plant, v1_1.default());
                        return [4 /*yield*/, fiber.initialize({ mkdir: true })];
                    case 2:
                        _e.sent();
                        if (!fork) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.current({ uuid: true })];
                    case 3:
                        current = _e.sent();
                        return [4 /*yield*/, fs_extra_1.default.copy(path_1.default.join(this.plant.paths.fibers, current, 'snapshots'), path_1.default.join(this.plant.paths.fibers, fiber.uuid, 'snapshots'))];
                    case 4:
                        _e.sent();
                        return [4 /*yield*/, this._stash(fiber.uuid, { copy: true })];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6:
                        if (!!open) return [3 /*break*/, 8];
                        return [4 /*yield*/, fiber._close()];
                    case 7:
                        _e.sent();
                        _e.label = 8;
                    case 8: return [4 /*yield*/, this.db.put(fiber.uuid, { name: name, wdir: 'null', snapshot: 'null', current: false })];
                    case 9:
                        _e.sent();
                        return [2 /*return*/, fiber];
                }
            });
        });
    };
    FiberFactory.prototype.load = function (nameOrUuid, _a) {
        var _b = (_a === void 0 ? {} : _a).uuid, uuid = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var uuid_, _c, fiber;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.exists(nameOrUuid, { uuid: uuid })];
                    case 1:
                        if (!(_d.sent()))
                            throw new error_1.default('E_FIBER_NOT_FOUND');
                        if (!uuid) return [3 /*break*/, 2];
                        _c = nameOrUuid;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.uuid(nameOrUuid)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        uuid_ = _c;
                        fiber = new _1.default(this.plant, uuid_);
                        return [4 /*yield*/, fiber.initialize()];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, fiber];
                }
            });
        });
    };
    FiberFactory.prototype.uuid = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var uuid;
            var _this = this;
            return __generator(this, function (_a) {
                uuid = undefined;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.db
                            .createReadStream()
                            .on('data', function (fiber) {
                            if (fiber.value.name === name) {
                                uuid = fiber.key;
                            }
                        })
                            .on('end', function () { resolve(uuid); })
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    FiberFactory.prototype.current = function (_a) {
        var _b = (_a === void 0 ? {} : _a).uuid, uuid = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var current;
            var _this = this;
            return __generator(this, function (_c) {
                current = undefined;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var write = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (fiber, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!fiber.value.current) return [3 /*break*/, 3];
                                            if (!uuid) return [3 /*break*/, 1];
                                            current = fiber.key;
                                            return [3 /*break*/, 3];
                                        case 1: return [4 /*yield*/, this.load(fiber.key, { uuid: true })];
                                        case 2:
                                            current = _a.sent();
                                            _a.label = 3;
                                        case 3:
                                            next();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        });
                        write
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            resolve(current);
                            return [2 /*return*/];
                        }); }); })
                            .on('error', function (err) { reject(err); });
                        _this.db
                            .createReadStream()
                            .pipe(write)
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    FiberFactory.prototype.switch = function (name, _a) {
        var _b = (_a === void 0 ? {} : _a).stash, stash = _b === void 0 ? true : _b;
        return __awaiter(this, void 0, void 0, function () {
            var ops, current, to, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            return __generator(this, function (_q) {
                switch (_q.label) {
                    case 0:
                        ops = [];
                        return [4 /*yield*/, this.current({ uuid: true })];
                    case 1:
                        current = _q.sent();
                        return [4 /*yield*/, this.uuid(name)];
                    case 2:
                        to = _q.sent();
                        if (typeof to === 'undefined')
                            throw new error_1.default('E_FIBER_NOT_FOUND');
                        if (!(typeof current !== 'undefined')) return [3 /*break*/, 5];
                        _d = (_c = ops).push;
                        _e = { type: 'put', key: current };
                        _f = [{}];
                        return [4 /*yield*/, this.db.get(current)];
                    case 3:
                        _d.apply(_c, [(_e.value = __assign.apply(void 0, _f.concat([_q.sent(), { current: false }])), _e)]);
                        _h = (_g = ops).push;
                        _j = { type: 'put', key: to };
                        _k = [{}];
                        return [4 /*yield*/, this.db.get(to)];
                    case 4:
                        _h.apply(_g, [(_j.value = __assign.apply(void 0, _k.concat([_q.sent(), { current: true }])), _j)]);
                        return [3 /*break*/, 7];
                    case 5:
                        _m = (_l = ops).push;
                        _o = { type: 'put', key: to };
                        _p = [{}];
                        return [4 /*yield*/, this.db.get(to)];
                    case 6:
                        _m.apply(_l, [(_o.value = __assign.apply(void 0, _p.concat([_q.sent(), { current: true }])), _o)]);
                        _q.label = 7;
                    case 7:
                        if (!stash) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._stash(current)];
                    case 8:
                        _q.sent();
                        return [4 /*yield*/, Promise.all([
                                this._unstash(to),
                                this.db.batch(ops)
                            ])];
                    case 9:
                        _q.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.db.batch(ops)];
                    case 11:
                        _q.sent();
                        _q.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    FiberFactory.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fibers;
            var _this = this;
            return __generator(this, function (_a) {
                fibers = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.db
                            .createReadStream()
                            .on('data', function (fiber) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                fibers.push(fiber.value);
                                return [2 /*return*/];
                            });
                        }); })
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                resolve(fibers);
                                return [2 /*return*/];
                            });
                        }); })
                            .on('error', function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    FiberFactory.prototype._stash = function (uuid, _a) {
        var _b = (_a === void 0 ? {} : _a).copy, copy = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var files, ops;
            var _this = this;
            return __generator(this, function (_c) {
                files = [];
                ops = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var write = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    files.push(file.path);
                                    next();
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        write
                            .on('error', function (err) { reject(err); })
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_1, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                            file = files_1[_i];
                                            if (copy) {
                                                ops.push(fs_extra_1.default.copy(file, path_1.default.join(this._paths(uuid, 'stash'), path_1.default.relative(this.plant.paths.root, file))));
                                            }
                                            else {
                                                ops.push(fs_extra_1.default.move(file, path_1.default.join(this._paths(uuid, 'stash'), path_1.default.relative(this.plant.paths.root, file)), { overwrite: true }));
                                            }
                                        }
                                        return [4 /*yield*/, Promise.all(ops)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        _this._ls(_this.plant.paths.root).pipe(write);
                    })];
            });
        });
    };
    FiberFactory.prototype._unstash = function (uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var files, ops;
            var _this = this;
            return __generator(this, function (_a) {
                files = [];
                ops = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var write = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (file, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    files.push(file.path);
                                    next();
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        write
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_2, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        for (_i = 0, files_2 = files; _i < files_2.length; _i++) {
                                            file = files_2[_i];
                                            ops.push(fs_extra_1.default.move(file, path_1.default.join(this.plant.paths.root, path_1.default.relative(this._paths(uuid, 'stash'), file)), { overwrite: true }));
                                        }
                                        return [4 /*yield*/, Promise.all(ops)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('error', function (err) { reject(err); });
                        _this
                            ._ls(_this._paths(uuid, 'stash'), { all: true })
                            .pipe(write)
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    FiberFactory.prototype._ls = function (path, _a) {
        var _b = (_a === void 0 ? {} : _a).all, all = _b === void 0 ? false : _b;
        return klaw_1.default(path)
            .pipe(through2_1.default.obj(function (item, enc, next) {
            if (!all && item.path.indexOf('.pando') >= 0) { // ignore .pando directory
                next();
            }
            else if (item.stats.isDirectory()) { // ignore empty directories
                next();
            }
            else {
                this.push(item);
                next();
            }
        }));
    };
    FiberFactory.prototype._paths = function (uuid, path) {
        switch (path) {
            case 'stash':
                return path_1.default.join(this.plant.paths.fibers, uuid, 'stash');
            default:
                throw new error_1.default('E_PATH_UNKNOWN', path);
        }
    };
    return FiberFactory;
}());
exports.default = FiberFactory;
//# sourceMappingURL=factory.js.map