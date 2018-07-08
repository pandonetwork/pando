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
var branch_1 = __importDefault(require("@components/branch"));
var tree_1 = __importDefault(require("@objects/tree"));
var utils = __importStar(require("@utils"));
var path_1 = __importDefault(require("path"));
var BranchFactory = /** @class */ (function () {
    function BranchFactory(repository) {
        this.repository = repository;
    }
    BranchFactory.prototype.create = function (name, opts) {
        if (this.exists(name, opts)) {
            var fullName = opts && opts.remote ? opts.remote + ':' + name : name;
            throw new Error('Branch ' + fullName + ' already exists');
        }
        return new branch_1.default(this.repository, name, opts);
    };
    BranchFactory.prototype.load = function (name, opts) {
        if (!this.exists(name, opts)) {
            var fullName = opts && opts.remote ? opts.remote + ':' + name : name;
            throw new Error('Branch ' + fullName + ' doesn not exist');
        }
        return new branch_1.default(this.repository, name, opts);
    };
    BranchFactory.prototype.exists = function (name, opts) {
        var fullName = opts && opts.remote ? opts.remote + ':' + name : name;
        return utils.fs.exists(path_1.default.join(this.repository.paths.branches, fullName));
    };
    BranchFactory.prototype.head = function (name, opts) {
        var fullName = opts && opts.remote ? opts.remote + ':' + name : name;
        return utils.yaml.read(path_1.default.join(this.repository.paths.branches, fullName));
    };
    BranchFactory.prototype.checkout = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var newHead, baseHead, baseTree, newTree, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.repository.index.update()];
                    case 1:
                        _c.sent();
                        if (!this.exists(name)) {
                            throw new Error('Branch ' + name + ' does not exist');
                        }
                        if (this.repository.currentBranchName === name) {
                            throw new Error('Already on branch ' + name);
                        }
                        if (this.repository.index.unsnapshot.length) {
                            throw new Error('You have unsnapshot modifications: ' +
                                this.repository.index.unsnapshot);
                        }
                        if (this.repository.index.modified.length) {
                            throw new Error('You have unstaged and unsnaphot modifications: ' +
                                this.repository.index.modified);
                        }
                        newHead = this.head(name);
                        baseHead = this.repository.head;
                        if (!(newHead !== 'undefined')) return [3 /*break*/, 9];
                        baseTree = void 0;
                        newTree = void 0;
                        return [4 /*yield*/, this.repository.node.get(newHead, 'tree')];
                    case 2:
                        newTree = _c.sent();
                        if (!(baseHead !== 'undefined')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.repository.node.get(baseHead, 'tree')];
                    case 3:
                        baseTree = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, new tree_1.default({ path: '.', children: [] }).toIPLD()];
                    case 5:
                        baseTree = _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, this.repository.updateWorkingDirectory(baseTree, newTree)];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, this.repository.index.reinitialize(newTree)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        _b = (_a = this.repository.index).reinitialize;
                        return [4 /*yield*/, new tree_1.default({ path: '.', children: [] }).toIPLD()];
                    case 10: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        this.repository.currentBranchName = name;
                        return [2 /*return*/];
                }
            });
        });
    };
    return BranchFactory;
}());
exports.default = BranchFactory;
//# sourceMappingURL=branch-factory.js.map