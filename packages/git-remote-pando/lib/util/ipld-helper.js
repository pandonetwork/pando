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
Object.defineProperty(exports, "__esModule", { value: true });
var cids_1 = __importDefault(require("cids"));
var ipfs_http_client_1 = __importDefault(require("ipfs-http-client"));
var ipld_1 = __importDefault(require("ipld"));
var ipld_git_1 = __importDefault(require("ipld-git"));
var util_1 = require("ipld-git/src/util/util");
var IPLDHelper = /** @class */ (function () {
    function IPLDHelper() {
        this._ipfs = ipfs_http_client_1.default({ host: 'localhost', port: '5001', protocol: 'http' });
        this._ipld = new ipld_1.default({
            blockService: this._ipfs.block,
            formats: [ipld_git_1.default]
        });
    }
    IPLDHelper.prototype.deserialize = function (buffer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ipld_git_1.default.util.deserialize(buffer, function (err, node) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(node);
                            }
                        });
                    })];
            });
        });
    };
    IPLDHelper.prototype.serialize = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ipld_git_1.default.util.serialize(node, function (err, buffer) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(buffer);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                    })];
            });
        });
    };
    IPLDHelper.prototype.put = function (object) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._ipld.put(object, { format: 'git-raw' }, function (err, cid) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(cid);
                            }
                        });
                    })];
            });
        });
    };
    IPLDHelper.prototype.get = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._ipld.get(new cids_1.default(cid), function (err, result) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(result.value);
                            }
                        });
                    })];
            });
        });
    };
    IPLDHelper.prototype.cid = function (object) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._ipld.put(object, { format: 'git-raw', onlyHash: true }, function (err, cid) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(cid.toBaseEncodedString());
                            }
                        });
                    })];
            });
        });
    };
    IPLDHelper.prototype.shaToCid = function (oid) {
        return (new cids_1.default(util_1.shaToCid(Buffer.from(oid, 'hex')))).toBaseEncodedString();
    };
    IPLDHelper.prototype.cidToSha = function (cid) {
        return util_1.cidToSha(new cids_1.default(cid)).toString('hex');
    };
    return IPLDHelper;
}());
exports.default = IPLDHelper;
//# sourceMappingURL=ipld-helper.js.map