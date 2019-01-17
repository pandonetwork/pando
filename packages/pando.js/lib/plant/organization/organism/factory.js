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
var level_1 = __importDefault(require("level"));
var path_1 = __importDefault(require("path"));
var stream_1 = __importDefault(require("stream"));
var _1 = __importDefault(require("."));
var error_1 = __importDefault(require("../../../error"));
var OrganismFactory = /** @class */ (function () {
    function OrganismFactory(organization) {
        this.organization = organization;
        this.path = path_1.default.join(organization.plant.paths.organizations, organization.address);
    }
    Object.defineProperty(OrganismFactory.prototype, "db", {
        get: function () {
            return level_1.default(this.path + '.db', { valueEncoding: 'json' });
        },
        enumerable: true,
        configurable: true
    });
    OrganismFactory.prototype.exists = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c, db;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined') {
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        }
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 1];
                        _c = address;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.address(name)];
                    case 2:
                        _c = _d.sent();
                        _d.label = 3;
                    case 3:
                        address = _c;
                        if (typeof address === 'undefined') {
                            return [2 /*return*/, false];
                        }
                        db = this.db;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.get(address, function (err, value) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, db.close()];
                                            case 1:
                                                _a.sent();
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
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                }
            });
        });
    };
    OrganismFactory.prototype.deploy = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, address, organism;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.organization.colony.deploy()];
                    case 1:
                        receipt = _a.sent();
                        address = this._getOrganismAddressFromReceipt(receipt);
                        return [4 /*yield*/, this.add(name, address)];
                    case 2:
                        organism = _a.sent();
                        return [2 /*return*/, organism];
                }
            });
        });
    };
    OrganismFactory.prototype.add = function (name, address) {
        return __awaiter(this, void 0, void 0, function () {
            var organism, db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exists({ name: name })];
                    case 1:
                        if (_a.sent()) {
                            throw new error_1.default('E_ORGANISM_NAME_ALREADY_EXISTS', name);
                        }
                        return [4 /*yield*/, this.exists({ address: address })];
                    case 2:
                        if (_a.sent()) {
                            throw new error_1.default('E_ORGANISM_ALREADY_EXISTS', address);
                        }
                        organism = new _1.default(this.organization, address);
                        db = this.db;
                        return [4 /*yield*/, db.put(organism.address, { name: name })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, db.close()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, organism];
                }
            });
        });
    };
    OrganismFactory.prototype.delete = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c, db;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined') {
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        }
                        return [4 /*yield*/, this.exists({ name: name, address: address })];
                    case 1:
                        if (!(_d.sent())) {
                            throw new error_1.default('E_ORGANISM_NOT_FOUND');
                        }
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 2];
                        _c = address;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.address(name)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        address = _c;
                        db = this.db;
                        return [4 /*yield*/, db.del(address)];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, db.close()];
                    case 6:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganismFactory.prototype.load = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined') {
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        }
                        return [4 /*yield*/, this.exists({ name: name, address: address })];
                    case 1:
                        if (!(_d.sent())) {
                            throw new error_1.default('E_ORGANISM_NOT_FOUND');
                        }
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 2];
                        _c = address;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.address(name)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        address = _c;
                        return [2 /*return*/, new _1.default(this.organization, address)];
                }
            });
        });
    };
    OrganismFactory.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var organisms, db;
            var _this = this;
            return __generator(this, function (_a) {
                organisms = [];
                db = this.db;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        db.createReadStream()
                            .on('data', function (organism) {
                            organisms.push(__assign({ address: organism.key }, organism.value));
                        })
                            .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.close()];
                                    case 1:
                                        _a.sent();
                                        resolve(organisms);
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('error', function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    OrganismFactory.prototype.address = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var address, db;
            var _this = this;
            return __generator(this, function (_a) {
                db = this.db;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var write = new stream_1.default.Writable({
                            objectMode: true,
                            write: function (organism, encoding, next) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (organism.value.name === name) {
                                        address = organism.key;
                                    }
                                    next();
                                    return [2 /*return*/];
                                });
                            }); },
                        });
                        write
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.close()];
                                    case 1:
                                        _a.sent();
                                        resolve(address);
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('error', function (err) {
                            reject(err);
                        });
                        db.createReadStream()
                            .pipe(write)
                            .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.close()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on('error', function (err) {
                            reject(err);
                        });
                    })
                    // return new Promise<string | undefined>((resolve, reject) => {
                    //   this.db
                    //     .createReadStream()
                    //     .on('data', organism => {
                    //       if (organism.value.name === name) {
                    //         address = organism.key
                    //       }
                    //     })
                    //     .on('end', () => {
                    //       resolve(address)
                    //     })
                    //     .on('error', err => {
                    //       reject(err)
                    //     })
                    // })
                ];
            });
        });
    };
    OrganismFactory.prototype._getOrganismAddressFromReceipt = function (receipt) {
        return receipt.logs.filter(function (l) { return l.event === 'DeployOrganism'; })[0].args.organism;
    };
    return OrganismFactory;
}());
exports.default = OrganismFactory;
//# sourceMappingURL=factory.js.map