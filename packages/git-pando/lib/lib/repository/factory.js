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
var COLONY_APP_ID = '0x63987fbbd4634a34320d02f82ebf1c6017da9956e3c198ef2ac06bb346f64667';
var RepositoryFactory = /** @class */ (function () {
    function RepositoryFactory(pando) {
        this.pando = pando;
    }
    RepositoryFactory.prototype.deploy = function (organization, name, description) {
        return __awaiter(this, void 0, void 0, function () {
            var wrapper, apps, address, colony, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wrapper = new wrapper_1.default(organization, {
                            provider: this.pando.options.ethereum.provider,
                            defaultGasPriceFn: function () { return String(5e9); },
                            apm: {
                                ipfs: {},
                                ensRegistryAddress: this.pando.options.apm.ens
                            }
                        });
                        return [4 /*yield*/, wrapper.init({ accounts: { providedAccounts: [this.pando.options.ethereum.account] } })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._apps(wrapper)];
                    case 2:
                        apps = _a.sent();
                        address = apps.filter(function (app) { return app.appId === COLONY_APP_ID; })[0].proxyAddress;
                        return [4 /*yield*/, this.pando.contracts.PandoColony.at(address)];
                    case 3:
                        colony = _a.sent();
                        return [4 /*yield*/, colony.createRepository(name, '')];
                    case 4:
                        receipt = _a.sent();
                        return [2 /*return*/, this._getRepositoryAddressFromReceipt(receipt)];
                }
            });
        });
    };
    RepositoryFactory.prototype._apps = function (wrapper) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        wrapper.apps.subscribe(function (apps) {
                            resolve(apps);
                        });
                    })];
            });
        });
    };
    RepositoryFactory.prototype._getRepositoryAddressFromReceipt = function (receipt) {
        return receipt.logs.filter(function (l) { return l.event === 'CreateRepository'; })[0].args.repository;
    };
    return RepositoryFactory;
}());
exports.default = RepositoryFactory;
//# sourceMappingURL=factory.js.map