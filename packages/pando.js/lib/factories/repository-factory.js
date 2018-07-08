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
var index_1 = __importDefault(require("@components/index"));
var node_1 = __importDefault(require("@components/node"));
var repository_1 = __importDefault(require("@components/repository"));
var _root_1 = __importDefault(require("@root"));
var utils = __importStar(require("@utils"));
var path_1 = __importDefault(require("path"));
var RepositoryFactory = /** @class */ (function () {
    function RepositoryFactory(pando) {
        this.pando = pando;
    }
    RepositoryFactory.prototype.create = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var repository, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.exists(path)) {
                            throw new Error('A repository already exists at ' + path);
                        }
                        repository = new repository_1.default(this.pando, path);
                        // Initialize .pando directory
                        utils.fs.mkdir(repository.paths.pando);
                        utils.fs.mkdir(repository.paths.ipfs);
                        utils.fs.mkdir(repository.paths.branches);
                        utils.fs.mkdir(repository.paths.remotes);
                        utils.yaml.write(repository.paths.index, {});
                        utils.yaml.write(repository.paths.config, this.pando.config);
                        // Initialize master branch
                        repository.branches.create('master');
                        utils.yaml.write(repository.paths.current, 'master');
                        // Initialize node and index
                        _a = repository;
                        return [4 /*yield*/, node_1.default.create(repository)];
                    case 1:
                        // Initialize node and index
                        _a.node = _c.sent();
                        _b = repository;
                        return [4 /*yield*/, index_1.default.new(repository)];
                    case 2:
                        _b.index = _c.sent();
                        return [2 /*return*/, repository];
                }
            });
        });
    };
    RepositoryFactory.prototype.load = function (path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var configuration, pando, repository, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.exists(path)) {
                            throw new Error('No repository found at ' + path);
                        }
                        configuration = utils.yaml.read(path_1.default.join(path, repository_1.default.paths.config));
                        pando = new _root_1.default(configuration);
                        repository = new repository_1.default(pando, path);
                        _a = repository;
                        return [4 /*yield*/, node_1.default.load(repository)];
                    case 1:
                        _a.node = _c.sent();
                        _b = repository;
                        return [4 /*yield*/, index_1.default.load(repository)];
                    case 2:
                        _b.index = _c.sent();
                        return [2 /*return*/, repository];
                }
            });
        });
    };
    RepositoryFactory.prototype.clone = function (address, path) {
        if (path === void 0) { path = '.'; }
        return __awaiter(this, void 0, void 0, function () {
            var repository, remote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.create(path)];
                    case 1:
                        repository = _a.sent();
                        return [4 /*yield*/, repository.remotes.add('origin', address)];
                    case 2:
                        remote = _a.sent();
                        return [4 /*yield*/, repository.pull('origin', 'master')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, repository];
                }
            });
        });
    };
    RepositoryFactory.prototype.exists = function (path) {
        if (path === void 0) { path = '.'; }
        return repository_1.default.exists(path);
    };
    return RepositoryFactory;
}());
exports.default = RepositoryFactory;
//# sourceMappingURL=repository-factory.js.map