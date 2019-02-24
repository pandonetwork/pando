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
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var zlib_1 = __importDefault(require("zlib"));
var GitHelper = /** @class */ (function () {
    function GitHelper(helper) {
        this.helper = helper;
    }
    GitHelper.prototype.debug = function (message) {
        this.helper.debug(message);
    };
    GitHelper.prototype.path = function (oid) {
        return __awaiter(this, void 0, void 0, function () {
            var subdirectory, filename;
            return __generator(this, function (_a) {
                subdirectory = oid.substring(0, 2);
                filename = oid.substring(2);
                return [2 /*return*/, path_1.default.join(this.helper.path, 'objects', subdirectory, filename)];
            });
        });
    };
    GitHelper.prototype.exists = function (oid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = fs_extra_1.default).pathExists;
                        return [4 /*yield*/, this.path(oid)];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    GitHelper.prototype.load = function (oid) {
        return __awaiter(this, void 0, void 0, function () {
            var path, buffer, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.path(oid)];
                    case 1:
                        path = _a.sent();
                        buffer = zlib_1.default.inflateSync(fs_extra_1.default.readFileSync(path));
                        return [4 /*yield*/, this.helper.ipld.deserialize(buffer)];
                    case 2:
                        node = _a.sent();
                        return [2 /*return*/, node];
                }
            });
        });
    };
    GitHelper.prototype.collect = function (oid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, mapping, node, _e, _cid, _node, _mapping, cid, cid, _f, _g, _i, entry, _h, _cid, _node, _mapping, cid;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        mapping = {};
                        return [4 /*yield*/, this.load(oid)];
                    case 1:
                        node = _j.sent();
                        if (!(node.gitType === 'commit')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.collect(this.helper.ipld.cidToSha(node['tree']['/']))];
                    case 2:
                        _e = _j.sent(), _cid = _e[0], _node = _e[1], _mapping = _e[2];
                        return [4 /*yield*/, this.helper.ipld.cid(node)];
                    case 3:
                        cid = _j.sent();
                        mapping = __assign({}, mapping, _mapping);
                        return [2 /*return*/, [cid, node, __assign({}, mapping, (_a = {}, _a[cid] = node, _a))]];
                    case 4:
                        if (!Buffer.isBuffer(node)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.helper.ipld.cid(node)];
                    case 5:
                        cid = _j.sent();
                        return [2 /*return*/, [cid, node, (_b = {}, _b[cid] = node, _b)]];
                    case 6:
                        _f = [];
                        for (_g in node)
                            _f.push(_g);
                        _i = 0;
                        _j.label = 7;
                    case 7:
                        if (!(_i < _f.length)) return [3 /*break*/, 10];
                        entry = _f[_i];
                        return [4 /*yield*/, this.collect(this.helper.ipld.cidToSha(node[entry]['hash']['/']))];
                    case 8:
                        _h = _j.sent(), _cid = _h[0], _node = _h[1], _mapping = _h[2];
                        mapping = __assign({}, mapping, (_c = {}, _c[_cid] = _node, _c), _mapping);
                        _j.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [4 /*yield*/, this.helper.ipld.cid(node)];
                    case 11:
                        cid = _j.sent();
                        return [2 /*return*/, [cid, node, __assign({}, mapping, (_d = {}, _d[cid] = node, _d))]];
                }
            });
        });
    };
    GitHelper.prototype.dump = function (oid, node) {
        return __awaiter(this, void 0, void 0, function () {
            var path, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.path(oid)];
                    case 1:
                        path = _a.sent();
                        return [4 /*yield*/, this.helper.ipld.serialize(node)];
                    case 2:
                        buffer = _a.sent();
                        return [4 /*yield*/, fs_extra_1.default.ensureFile(path)];
                    case 3:
                        _a.sent();
                        fs_extra_1.default.writeFileSync(path, zlib_1.default.deflateSync(buffer));
                        return [2 /*return*/];
                }
            });
        });
    };
    GitHelper.prototype.download = function (oid) {
        return __awaiter(this, void 0, void 0, function () {
            var cid, node, _i, _a, parent_1, _b, _c, _d, entry, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.exists(oid)];
                    case 1:
                        // this._debug('downloading', oid)
                        if (_f.sent())
                            return [2 /*return*/];
                        cid = this.helper.ipld.shaToCid(oid);
                        return [4 /*yield*/, this.helper.ipld.get(cid)];
                    case 2:
                        node = _f.sent();
                        if (!(node.gitType === 'commit')) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.download(this.helper.ipld.cidToSha(node['tree']['/']))];
                    case 3:
                        _f.sent();
                        _i = 0, _a = node.parents;
                        _f.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        parent_1 = _a[_i];
                        return [4 /*yield*/, this.download(this.helper.ipld.cidToSha(parent_1['/']))];
                    case 5:
                        _f.sent();
                        _f.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, this.dump(oid, node)];
                    case 8:
                        _f.sent();
                        return [3 /*break*/, 18];
                    case 9:
                        if (!Buffer.isBuffer(node)) return [3 /*break*/, 11];
                        // node is a blob
                        return [4 /*yield*/, this.dump(oid, node)];
                    case 10:
                        // node is a blob
                        _f.sent();
                        return [3 /*break*/, 18];
                    case 11:
                        _b = [];
                        for (_c in node)
                            _b.push(_c);
                        _d = 0;
                        _f.label = 12;
                    case 12:
                        if (!(_d < _b.length)) return [3 /*break*/, 16];
                        entry = _b[_d];
                        _e = this.download;
                        return [4 /*yield*/, this.helper.ipld.cidToSha(node[entry]['hash']['/'])];
                    case 13: return [4 /*yield*/, _e.apply(this, [_f.sent()])];
                    case 14:
                        _f.sent();
                        _f.label = 15;
                    case 15:
                        _d++;
                        return [3 /*break*/, 12];
                    case 16: return [4 /*yield*/, this.dump(oid, node)];
                    case 17:
                        _f.sent();
                        _f.label = 18;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    return GitHelper;
}());
exports.default = GitHelper;
//# sourceMappingURL=git-helper.js.map