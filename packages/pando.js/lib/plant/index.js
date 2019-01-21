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
var fs_extra_1 = __importDefault(require("fs-extra"));
var ipfs_http_client_1 = __importDefault(require("ipfs-http-client"));
var klaw_1 = __importDefault(require("klaw"));
var path_1 = __importDefault(require("path"));
var stream_1 = __importDefault(require("stream"));
var through2_1 = __importDefault(require("through2"));
var factory_1 = __importDefault(require("./fiber/factory"));
var factory_2 = __importDefault(require("./organization/factory"));
var Plant = /** @class */ (function () {
    function Plant(pando, path, node) {
        if (path === void 0) { path = '.'; }
        this.pando = pando;
        this.paths = {
            fibers: path_1.default.join(path, '.pando', 'fibers'),
            ipfs: path_1.default.join(path, '.pando', 'ipfs'),
            organizations: path_1.default.join(path, '.pando', 'organizations'),
            pando: path_1.default.join(path, '.pando'),
            root: path,
        };
        this.node = node;
        this.organizations = new factory_2.default(this);
        this.fibers = new factory_1.default(this);
    }
    Plant.prototype.extract = function (_organization, _organism) {
        return __awaiter(this, void 0, void 0, function () {
            var ipfs, organization, organism, head, fiber, metadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfs = new ipfs_http_client_1.default({ host: 'localhost', port: '5001', protocol: 'http' });
                        return [4 /*yield*/, this.organizations.load({ name: _organization })];
                    case 1:
                        organization = _a.sent();
                        return [4 /*yield*/, organization.organisms.load({ name: _organism })];
                    case 2:
                        organism = _a.sent();
                        return [4 /*yield*/, organism.head()];
                    case 3:
                        head = _a.sent();
                        if (!(head.blockstamp !== 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.fibers.current()];
                    case 4:
                        fiber = (_a.sent());
                        return [4 /*yield*/, fiber.snapshot("Automatic snapshot before extraction of " + _organization + ":" + _organism)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._clear()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, ipfs.dag.get(head.metadata)];
                    case 7:
                        metadata = _a.sent();
                        return [4 /*yield*/, this._download(metadata.value.tree)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Plant.prototype.publish = function (organizationName, organismName, message) {
        if (message === void 0) { message = 'n/a'; }
        return __awaiter(this, void 0, void 0, function () {
            var fiber, snapshot, metadata, lineage, cid, individuation, organization, address, peer, gateway, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fibers.current()];
                    case 1:
                        fiber = (_a.sent());
                        return [4 /*yield*/, fiber.snapshot('Automatic snapshot before RFI')];
                    case 2:
                        snapshot = _a.sent();
                        metadata = {
                            message: message,
                            tree: snapshot.tree,
                        };
                        lineage = {
                            destination: this.pando.options.ethereum.account,
                            metadata: '',
                            minimum: 0,
                        };
                        return [4 /*yield*/, this.node.dag.put(metadata, { format: 'dag-cbor', hashAlg: 'sha3-512' })];
                    case 3:
                        cid = (_a.sent()).toBaseEncodedString();
                        individuation = {
                            metadata: cid,
                        };
                        return [4 /*yield*/, this.organizations.load({ name: organizationName })];
                    case 4:
                        organization = _a.sent();
                        return [4 /*yield*/, organization.organisms.address(organismName)];
                    case 5:
                        address = _a.sent();
                        return [4 /*yield*/, this.node.start()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.node.id()];
                    case 7:
                        peer = _a.sent();
                        gateway = ipfs_http_client_1.default({ host: 'localhost', port: '5001', protocol: 'http' });
                        return [4 /*yield*/, gateway.swarm.connect('/ip4/127.0.0.1/tcp/4003/ws/ipfs/' + peer.id)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, gateway.pin.add(cid)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, gateway.pin.add(snapshot.tree)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.node.stop()];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, organization.scheme.createRFI(address, individuation, [lineage])];
                    case 12:
                        receipt = _a.sent();
                        return [2 /*return*/, receipt];
                }
            });
        });
    };
    Plant.prototype.remove = function () {
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
                        if (!this.organizations.db.isOpen()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.organizations.db.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        fs_extra_1.default.removeSync(this.paths.pando);
                        return [2 /*return*/];
                }
            });
        });
    };
    Plant.prototype._download = function (cid, relativePath) {
        if (relativePath === void 0) { relativePath = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var ipfs, entries, _i, entries_1, entry, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfs = new ipfs_http_client_1.default({ host: 'localhost', port: '5001', protocol: 'http' });
                        return [4 /*yield*/, ipfs.ls(cid)];
                    case 1:
                        entries = _a.sent();
                        _i = 0, entries_1 = entries;
                        _a.label = 2;
                    case 2:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 10];
                        entry = entries_1[_i];
                        if (!(entry.type === 'dir')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._download(entry.hash, path_1.default.join(relativePath, entry.name))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, fs_extra_1.default.ensureDir(path_1.default.join(this.paths.root, this.paths.root, relativePath, entry.name))];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, ipfs.cat(entry.hash)];
                    case 6:
                        buffer = _a.sent();
                        return [4 /*yield*/, fs_extra_1.default.ensureFile(path_1.default.join(this.paths.root, relativePath, entry.name))];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, fs_extra_1.default.writeFile(path_1.default.join(this.paths.root, relativePath, entry.name), buffer)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 2];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Plant.prototype._clear = function () {
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
                            }); },
                        });
                        write
                            .on('error', function (err) {
                            reject(err);
                        })
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_1, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                            file = files_1[_i];
                                            ops.push(fs_extra_1.default.remove(file));
                                        }
                                        return [4 /*yield*/, Promise.all(ops)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        _this._ls(_this.paths.root, { dir: true }).pipe(write);
                    })];
            });
        });
    };
    Plant.prototype._ls = function (path, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.all, all = _c === void 0 ? false : _c, _d = _b.dir, dir = _d === void 0 ? false : _d;
        var root = path_1.default.resolve(this.paths.root);
        return klaw_1.default(path).pipe(through2_1.default.obj(function (item, enc, next) {
            if (item.path === root) {
                // ignore .
                next();
            }
            else if (!all && item.path.indexOf('.pando') >= 0) {
                // ignore .pando directory
                next();
            }
            else if (!dir && item.stats.isDirectory()) {
                // ignore empty directories
                next();
            }
            else {
                this.push(item);
                next();
            }
        }));
    };
    return Plant;
}());
exports.default = Plant;
//# sourceMappingURL=index.js.map