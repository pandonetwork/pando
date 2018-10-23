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
var cids_1 = __importDefault(require("cids"));
var ipfs_api_1 = __importDefault(require("ipfs-api"));
var path_1 = __importDefault(require("path"));
var url_parse_1 = __importDefault(require("url-parse"));
var utils = __importStar(require("../utils"));
var Node = /** @class */ (function () {
    function Node(repository, ipfs) {
        this.repository = repository;
        this.ipfs = ipfs;
    }
    Node.create = function (repository) {
        return __awaiter(this, void 0, void 0, function () {
            var url, ipfs;
            return __generator(this, function (_a) {
                url = url_parse_1.default(repository.config.ipfs.gateway, true);
                ipfs = ipfs_api_1.default(url.hostname, url.port, {
                    protocol: url.protocol.slice(0, -1)
                });
                return [2 /*return*/, new Node(repository, ipfs)];
            });
        });
    };
    Node.load = function (repository) {
        return __awaiter(this, void 0, void 0, function () {
            var url, ipfs;
            return __generator(this, function (_a) {
                url = url_parse_1.default(repository.config.ipfs.gateway, true);
                ipfs = ipfs_api_1.default(url.hostname, url.port, {
                    protocol: url.protocol.slice(0, -1)
                });
                return [2 /*return*/, new Node(repository, ipfs)];
            });
        });
    };
    Node.prototype.upload = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ipfs.files.add([
                            {
                                content: utils.fs.read(path),
                                path: path_1.default.relative(this.repository.paths.root, path)
                            }
                        ])];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results[0].hash];
                }
            });
        });
    };
    Node.prototype.download = function (cid, path) {
        return __awaiter(this, void 0, void 0, function () {
            var result, node, nodePath, _a, _b, _i, entry, buffer;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = path || '';
                        cid = cids_1.default.isCID(cid) ? cid : new cids_1.default(cid);
                        return [4 /*yield*/, this.ipfs.dag.get(cid, path)];
                    case 1:
                        result = _c.sent();
                        node = result.value;
                        nodePath = path_1.default.join(this.repository.paths.root, node.path);
                        if (!(node['@type'] === 'tree')) return [3 /*break*/, 6];
                        if (!utils.fs.exists(nodePath)) {
                            utils.fs.mkdir(nodePath);
                        }
                        delete node['@type'];
                        delete node.path;
                        _a = [];
                        for (_b in node)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        entry = _a[_i];
                        if (!node.hasOwnProperty(entry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.download(cid, path + '/' + entry)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        if (!(node['@type'] === 'file')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.ipfs.files.cat(cid.toBaseEncodedString() + '/' + path + '/link')];
                    case 7:
                        buffer = _c.sent();
                        utils.fs.write(nodePath, buffer);
                        _c.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.put = function (object) {
        return __awaiter(this, void 0, void 0, function () {
            var cid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ipfs.dag.put(object, {
                            format: 'dag-cbor',
                            hashAlg: 'keccak-256'
                        })];
                    case 1:
                        cid = _a.sent();
                        return [2 /*return*/, cid];
                }
            });
        });
    };
    Node.prototype.get = function (cid, path) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = cids_1.default.isCID(cid) ? cid : new cids_1.default(cid);
                        path = path || '';
                        return [4 /*yield*/, this.ipfs.dag.get(cid, path)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    Node.prototype.cid = function (data, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var file, results, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(opts && opts.file)) return [3 /*break*/, 2];
                        file = [
                            {
                                content: utils.fs.read(data),
                                path: path_1.default.relative(this.repository.paths.root, data)
                            }
                        ];
                        return [4 /*yield*/, this.ipfs.files.add(file, { 'only-hash': true })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results[0].hash];
                    case 2: return [4 /*yield*/, this.ipfs.dag.put(data, {
                            format: 'dag-cbor',
                            hashAlg: 'keccak-256'
                        })];
                    case 3:
                        hash = _a.sent();
                        return [2 /*return*/, hash.toBaseEncodedString()];
                }
            });
        });
    };
    return Node;
}());
exports.default = Node;
//# sourceMappingURL=node.js.map