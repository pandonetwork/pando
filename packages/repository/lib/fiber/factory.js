"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var FiberFactory = /** @class */ (function () {
    function FiberFactory(repository) {
        this.repository = repository;
        this.db = level_1.default(path_1.default.join(repository.paths.fibers, 'db'), { valueEncoding: 'json' });
    }
    FiberFactory.prototype.current = function (_a) {
        var _b = (_a === void 0 ? {} : _a).uuid, uuid = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.db
                            .createReadStream()
                            .on('data', function (fiber) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!fiber.value.current) return [3 /*break*/, 3];
                                        if (!uuid) return [3 /*break*/, 1];
                                        resolve(fiber.key);
                                        return [3 /*break*/, 3];
                                    case 1:
                                        _a = resolve;
                                        return [4 /*yield*/, this.load(fiber.key)];
                                    case 2:
                                        _a.apply(void 0, [_b.sent()]);
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                resolve(undefined);
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
    FiberFactory.prototype.create = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var fiber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.default.create(this.repository)];
                    case 1:
                        fiber = _a.sent();
                        return [4 /*yield*/, this.db.put(fiber.uuid, { name: name, wdir: 'null', snapshot: 'null', current: false })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, fiber];
                }
            });
        });
    };
    FiberFactory.prototype.load = function (name) {
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
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(typeof uuid === 'undefined')) return [3 /*break*/, 1];
                                        reject(new Error('Unknown branch ' + name));
                                        return [3 /*break*/, 3];
                                    case 1:
                                        _a = resolve;
                                        return [4 /*yield*/, _1.default.load(this.repository, uuid)];
                                    case 2:
                                        _a.apply(void 0, [_b.sent()]);
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }).
                            on('error', function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    FiberFactory.prototype.switch = function (name, _a) {
        var _b = (_a === void 0 ? {} : _a).stash, stash = _b === void 0 ? true : _b;
        return __awaiter(this, void 0, void 0, function () {
            var from, to, ops;
            var _this = this;
            return __generator(this, function (_c) {
                from = undefined;
                to = undefined;
                ops = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var read = _this.db.createReadStream();
                        var write = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (fiber, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (fiber.value.current) {
                                        from = fiber.key;
                                        ops.push({ type: 'put', key: fiber.key, value: __assign({}, fiber.value, { current: false }) });
                                    }
                                    if (fiber.value.name === name) {
                                        to = fiber.key;
                                        ops.push({ type: 'put', key: fiber.key, value: __assign({}, fiber.value, { current: true }) });
                                    }
                                    next();
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        write
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!stash) return [3 /*break*/, 2];
                                        // throw if uuid is undefined
                                        console.log('Finish');
                                        return [4 /*yield*/, Promise.all([
                                                this._stash(from),
                                                this._unstash(to),
                                                this.db.batch(ops)
                                            ])];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, this.db.batch(ops)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('error', function (err) { reject(err); });
                        read
                            .pipe(write)
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    FiberFactory.prototype._stash = function (uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var ops, files;
            var _this = this;
            return __generator(this, function (_a) {
                ops = [];
                files = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        klaw_1.default(_this.repository.paths.root, { depthLimit: 0 })
                            .pipe(through2_1.default.obj(function (item, enc, next) {
                            if (item.path.indexOf('.pando') >= 0) {
                                next();
                            }
                            else {
                                this.push(item);
                                next();
                            }
                        }))
                            .on('data', function (file) {
                            files.push(file.path);
                        })
                            .on('error', function (err) {
                            reject(err);
                        })
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_1, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        files.shift();
                                        // empty fibers/uuid/backup
                                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                            file = files_1[_i];
                                            ops.push(fs_extra_1.default.move(file, path_1.default.join(this.repository.paths.fibers, uuid, 'stash', path_1.default.basename(file))));
                                        }
                                        return [4 /*yield*/, Promise.all(ops)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    FiberFactory.prototype._unstash = function (uuid) {
        return __awaiter(this, void 0, void 0, function () {
            var ops, files;
            var _this = this;
            return __generator(this, function (_a) {
                ops = [];
                files = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        klaw_1.default(path_1.default.join(_this.repository.paths.fibers, uuid, 'stash'), { depthLimit: 0 })
                            .on('data', function (file) {
                            files.push(file.path);
                        })
                            .on('error', function (err) {
                            reject(err);
                        })
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_2, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        files.shift();
                                        console.log('UNSTASH: ' + path_1.default.join(this.repository.paths.fibers, uuid, 'stash'));
                                        console.log(files);
                                        for (_i = 0, files_2 = files; _i < files_2.length; _i++) {
                                            file = files_2[_i];
                                            console.log('To move back: ' + file);
                                            ops.push(fs_extra_1.default.move(file, path_1.default.join(this.repository.paths.root, path_1.default.basename(file))));
                                        }
                                        return [4 /*yield*/, Promise.all(ops)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    return FiberFactory;
}());
exports.default = FiberFactory;
//# sourceMappingURL=factory.js.map