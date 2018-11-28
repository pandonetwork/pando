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
var fs_extra_1 = __importDefault(require("fs-extra"));
var ipfs_1 = __importDefault(require("ipfs"));
var path_1 = __importDefault(require("path"));
var factory_1 = __importDefault(require("./fiber/factory"));
var error_1 = __importDefault(require("./error"));
var util_1 = __importDefault(require("util"));
// import Index from '@pando/index'
var ensure = util_1.default.promisify(fs_extra_1.default.ensureDir);
var Repository = /** @class */ (function () {
    // public index: Index
    function Repository(path, node) {
        if (path === void 0) { path = '.'; }
        this.paths = __assign({}, Repository.paths);
        this.paths['root'] = path;
        this.paths['pando'] = path_1.default.join(path, '.pando');
        this.paths['ipfs'] = path_1.default.join(path, '.pando', 'ipfs');
        this.paths['fibers'] = path_1.default.join(path, '.pando', 'fibers');
        this.node = node;
        this.fibers = new factory_1.default(this);
    }
    Repository.exists = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, one, two, three;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fs_extra_1.default.pathExists(path_1.default.join(path, '.pando')),
                            fs_extra_1.default.pathExists(path_1.default.join(path, '.pando', 'ipfs')),
                            fs_extra_1.default.pathExists(path_1.default.join(path, '.pando', 'fibers', 'db'))
                        ])];
                    case 1:
                        _a = _b.sent(), one = _a[0], two = _a[1], three = _a[2];
                        return [2 /*return*/, one && two && three];
                }
            });
        });
    };
    Repository.create = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var node;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // TODO: check that path exists
                                return [4 /*yield*/, Promise.all([
                                        ensure(path_1.default.join(path, '.pando', 'ipfs')),
                                        ensure(path_1.default.join(path, '.pando', 'fibers'))
                                    ])];
                                case 1:
                                    // TODO: check that path exists
                                    _a.sent();
                                    node = new ipfs_1.default({ repo: path_1.default.join(path, '.pando', 'ipfs'), start: false })
                                        .on('error', function (err) {
                                        reject(err);
                                    })
                                        .on('ready', function () { return __awaiter(_this, void 0, void 0, function () {
                                        var repository;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    repository = new Repository(path, node);
                                                    return [4 /*yield*/, repository.fibers.create('master', { fork: false })];
                                                case 1:
                                                    _a.sent();
                                                    return [4 /*yield*/, repository.fibers.switch('master', { stash: false })];
                                                case 2:
                                                    _a.sent();
                                                    resolve(repository);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Repository.load = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var node;
                        var _this = this;
                        return __generator(this, function (_a) {
                            if (!Repository.exists(path)) {
                                reject(new error_1.default('E_REPOSITORY_NOT_FOUND', path));
                            }
                            node = new ipfs_1.default({ repo: path_1.default.join(path, '.pando', 'ipfs'), start: false })
                                .on('error', function (err) {
                                reject(err);
                            })
                                .on('ready', function () { return __awaiter(_this, void 0, void 0, function () {
                                var repository;
                                return __generator(this, function (_a) {
                                    repository = new Repository(path, node);
                                    resolve(repository);
                                    return [2 /*return*/];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Repository.prototype.remove = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.fibers.db.isOpen()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fibers.db.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        fs_extra_1.default.removeSync(this.paths.pando);
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.paths = {
        root: '.',
        pando: '.pando',
        ipfs: '.pando/ipfs',
        index: '.pando/index',
        db: '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        fibers: '.pando/fibers',
    };
    return Repository;
}());
exports.default = Repository;
//# sourceMappingURL=index.js.map