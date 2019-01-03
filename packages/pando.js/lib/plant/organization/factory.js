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
var path_1 = __importDefault(require("path"));
var level_1 = __importDefault(require("level"));
var apm_1 = __importDefault(require("@aragon/apm"));
var web3_1 = __importDefault(require("web3"));
var error_1 = __importDefault(require("../../error"));
var _1 = __importDefault(require("."));
var APP_IDS = {
    'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
    'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
    'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
};
var OrganizationFactory = /** @class */ (function () {
    function OrganizationFactory(plant) {
        this.plant = plant;
        this.db = level_1.default(path_1.default.join(plant.paths.organizations, 'organizations.db'), { valueEncoding: 'json' });
    }
    OrganizationFactory.prototype.exists = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined')
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 1];
                        _c = address;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.address(name)];
                    case 2:
                        _c = _d.sent();
                        _d.label = 3;
                    case 3:
                        address = _c;
                        if (typeof address === 'undefined')
                            return [2 /*return*/, false];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.db.get(address, function (err, value) {
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
    OrganizationFactory.prototype.deploy = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var apm, factory, _a, _b, receipt, organization;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.exists({ name: name })];
                    case 1:
                        if (_c.sent())
                            throw new error_1.default('E_ORGANIZATION_NAME_ALREADY_EXISTS', name);
                        apm = apm_1.default(new web3_1.default(this.plant.pando.options.ethereum.provider), { ensRegistryAddress: this.plant.pando.options.apm.ens, ipfs: 'http://locahost:5001' });
                        _b = (_a = this.plant.pando.contracts.OrganizationFactory).at;
                        return [4 /*yield*/, apm.getLatestVersionContract('organization-factory.aragonpm.eth')];
                    case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                    case 3:
                        factory = _c.sent();
                        return [4 /*yield*/, factory.newInstance()];
                    case 4:
                        receipt = _c.sent();
                        return [4 /*yield*/, this.add(name, this._getDAOAddressFromReceipt(receipt))];
                    case 5:
                        organization = _c.sent();
                        return [2 /*return*/, organization];
                }
            });
        });
    };
    OrganizationFactory.prototype.add = function (name, address) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exists({ name: name })];
                    case 1:
                        if (_a.sent())
                            throw new error_1.default('E_ORGANIZATION_NAME_ALREADY_EXISTS', name);
                        return [4 /*yield*/, this.exists({ address: address })];
                    case 2:
                        if (_a.sent())
                            throw new error_1.default('E_ORGANIZATION_ALREADY_EXISTS', address);
                        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var kernel, acl, colony, scheme, _a, _b;
                                var _this = this;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, this.plant.pando.contracts.Kernel.at(address)];
                                        case 1:
                                            kernel = _c.sent();
                                            _b = (_a = this.plant.pando.contracts.ACL).at;
                                            return [4 /*yield*/, kernel.acl()];
                                        case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                                        case 3:
                                            acl = _c.sent();
                                            kernel.NewAppProxy({}, { fromBlock: 0, toBlock: 'latest' }).get(function (err, events) { return __awaiter(_this, void 0, void 0, function () {
                                                var _i, events_1, event_1, _a, organization;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            if (err)
                                                                reject(err);
                                                            _i = 0, events_1 = events;
                                                            _b.label = 1;
                                                        case 1:
                                                            if (!(_i < events_1.length)) return [3 /*break*/, 7];
                                                            event_1 = events_1[_i];
                                                            _a = event_1.args.appId;
                                                            switch (_a) {
                                                                case APP_IDS.colony: return [3 /*break*/, 2];
                                                                case APP_IDS.scheme: return [3 /*break*/, 4];
                                                            }
                                                            return [3 /*break*/, 6];
                                                        case 2: return [4 /*yield*/, this.plant.pando.contracts.Colony.at(event_1.args.proxy)];
                                                        case 3:
                                                            colony = _b.sent();
                                                            return [3 /*break*/, 6];
                                                        case 4: return [4 /*yield*/, this.plant.pando.contracts.DemocracyScheme.at(event_1.args.proxy)];
                                                        case 5:
                                                            scheme = _b.sent();
                                                            return [3 /*break*/, 6];
                                                        case 6:
                                                            _i++;
                                                            return [3 /*break*/, 1];
                                                        case 7:
                                                            organization = new _1.default(this.plant, address, kernel, acl, colony, scheme);
                                                            return [4 /*yield*/, this.db.put(organization.address, {
                                                                    name: name,
                                                                    acl: organization.acl.address,
                                                                    colony: organization.colony.address,
                                                                    scheme: organization.scheme.address
                                                                })];
                                                        case 8:
                                                            _b.sent();
                                                            resolve(organization);
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    OrganizationFactory.prototype.delete = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined')
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        return [4 /*yield*/, this.exists({ name: name, address: address })];
                    case 1:
                        if (!(_d.sent()))
                            throw new error_1.default('E_ORGANIZATION_NOT_FOUND');
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 2];
                        _c = address;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.address(name)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        address = _c;
                        return [4 /*yield*/, this.db.del(address)];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationFactory.prototype.load = function (_a) {
        var _b = _a === void 0 ? {} : _a, name = _b.name, address = _b.address;
        return __awaiter(this, void 0, void 0, function () {
            var _c, organization, kernel, acl, colony, scheme;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof name === 'undefined' && typeof address === 'undefined')
                            throw new error_1.default('E_WRONG_PARAMETERS', name, address);
                        return [4 /*yield*/, this.exists({ name: name, address: address })];
                    case 1:
                        if (!(_d.sent()))
                            throw new error_1.default('E_ORGANIZATION_NOT_FOUND');
                        if (!(typeof address !== 'undefined')) return [3 /*break*/, 2];
                        _c = address;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.address(name)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        address = _c;
                        return [4 /*yield*/, this.db.get(address)];
                    case 5:
                        organization = _d.sent();
                        return [4 /*yield*/, this.plant.pando.contracts.Kernel.at(address)];
                    case 6:
                        kernel = _d.sent();
                        return [4 /*yield*/, this.plant.pando.contracts.ACL.at(organization.acl)];
                    case 7:
                        acl = _d.sent();
                        return [4 /*yield*/, this.plant.pando.contracts.Colony.at(organization.colony)];
                    case 8:
                        colony = _d.sent();
                        return [4 /*yield*/, this.plant.pando.contracts.DemocracyScheme.at(organization.scheme)];
                    case 9:
                        scheme = _d.sent();
                        return [2 /*return*/, new _1.default(this.plant, address, kernel, acl, colony, scheme)];
                }
            });
        });
    };
    OrganizationFactory.prototype.address = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var address;
            var _this = this;
            return __generator(this, function (_a) {
                address = undefined;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.db
                            .createReadStream()
                            .on('data', function (organization) {
                            if (organization.value.name === name) {
                                address = organization.key;
                            }
                        })
                            .on('end', function () { resolve(address); })
                            .on('error', function (err) { reject(err); });
                    })];
            });
        });
    };
    OrganizationFactory.prototype._getDAOAddressFromReceipt = function (receipt) {
        return receipt.logs.filter(function (l) { return l.event == 'DeployInstance'; })[0].args.dao;
    };
    return OrganizationFactory;
}());
exports.default = OrganizationFactory;
//# sourceMappingURL=factory.js.map