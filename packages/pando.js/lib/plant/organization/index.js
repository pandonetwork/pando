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
var wrapper_1 = __importDefault(require("@aragon/wrapper"));
var APP_IDS = {
    'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
    'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
    'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
};
var Organization = /** @class */ (function () {
    function Organization(plant, address) {
        this.plant = plant;
        this.address = address;
    }
    Organization.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, aragon;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = this;
                                    return [4 /*yield*/, this.plant.pando.contracts.Kernel.at(this.address)];
                                case 1:
                                    _a.kernel = _b.sent();
                                    aragon = new wrapper_1.default(this.address, {
                                        provider: this.plant.pando.options.ethereum.provider,
                                        apm: { ensRegistryAddress: this.plant.pando.options.apm.ens }
                                    });
                                    return [4 /*yield*/, aragon.init({
                                            accounts: { providedAccounts: [this.plant.pando.options.ethereum.account] }
                                        })];
                                case 2:
                                    _b.sent();
                                    aragon.apps
                                        .take(1)
                                        .subscribe(function (apps) { return __awaiter(_this, void 0, void 0, function () {
                                        var _i, apps_1, app, _a, _b, _c, _d;
                                        return __generator(this, function (_e) {
                                            switch (_e.label) {
                                                case 0:
                                                    _i = 0, apps_1 = apps;
                                                    _e.label = 1;
                                                case 1:
                                                    if (!(_i < apps_1.length)) return [3 /*break*/, 9];
                                                    app = apps_1[_i];
                                                    _a = app.appId;
                                                    switch (_a) {
                                                        case APP_IDS.acl: return [3 /*break*/, 2];
                                                        case APP_IDS.colony: return [3 /*break*/, 4];
                                                        case APP_IDS.scheme: return [3 /*break*/, 6];
                                                    }
                                                    return [3 /*break*/, 8];
                                                case 2:
                                                    _b = this;
                                                    return [4 /*yield*/, this.plant.pando.contracts.ACL.at(app.proxyAddress)];
                                                case 3:
                                                    _b.acl = _e.sent();
                                                    return [3 /*break*/, 8];
                                                case 4:
                                                    _c = this;
                                                    return [4 /*yield*/, this.plant.pando.contracts.Colony.at(app.proxyAddress)];
                                                case 5:
                                                    _c.colony = _e.sent();
                                                    return [3 /*break*/, 8];
                                                case 6:
                                                    _d = this;
                                                    return [4 /*yield*/, this.plant.pando.contracts.DemocracyScheme.at(app.proxyAddress)];
                                                case 7:
                                                    _d.scheme = _e.sent();
                                                    return [3 /*break*/, 8];
                                                case 8:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 9:
                                                    resolve();
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
    return Organization;
}());
exports.default = Organization;
//# sourceMappingURL=index.js.map