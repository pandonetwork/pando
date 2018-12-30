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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var level_1 = __importDefault(require("level"));
var apm_1 = __importDefault(require("@aragon/apm"));
var web3_1 = __importDefault(require("web3"));
var _1 = __importDefault(require("."));
var db = function (location, options) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                level_1.default(location, options, function (err, dbs) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(dbs);
                    }
                });
            })];
    });
}); };
var OrganizationFactory = /** @class */ (function () {
    function OrganizationFactory(plant) {
        this.plant = plant;
        this.db = level_1.default(path_1.default.join(plant.paths.organizations, 'db'), { valueEncoding: 'json' });
    }
    OrganizationFactory.prototype.create = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var organization;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deploy()];
                    case 1:
                        organization = _a.sent();
                        return [4 /*yield*/, this.db.put(organization.address, {
                                name: name,
                                acl: organization.acl.address,
                                colony: organization.colony.address,
                                scheme: organization.scheme.address
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, organization];
                }
            });
        });
    };
    // public async load(nameOrAddress: string, { address = false }: { address?: boolean } = {}): Promise<Organization> {
    //   return new Promise<Organization>((resolve, reject) => {
    //
    //   })
    // }
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
    OrganizationFactory.prototype.deploy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var apm, factory, _a, _b, receipt, organization;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        apm = apm_1.default(new web3_1.default(this.plant.pando.options.ethereum.provider), { ensRegistryAddress: this.plant.pando.options.apm.ens, ipfs: 'http://locahost:5001' });
                        _b = (_a = this.plant.pando.contracts.OrganizationFactory).at;
                        return [4 /*yield*/, apm.getLatestVersionContract('organization-factory.aragonpm.eth')];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                    case 2:
                        factory = _c.sent();
                        return [4 /*yield*/, factory.newInstance()
                            // const kernel = await this.plant.pando.contracts.Kernel.at(this._getDAOAddressFromReceipt(receipt))
                        ];
                    case 3:
                        receipt = _c.sent();
                        organization = new _1.default(this.plant, this._getDAOAddressFromReceipt(receipt));
                        return [4 /*yield*/, organization.initialize()];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, organization];
                }
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