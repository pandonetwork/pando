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
var apm_1 = __importDefault(require("@aragon/apm"));
var web3_1 = __importDefault(require("web3"));
var _1 = __importDefault(require("."));
var APP_IDS = {
    acl: '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
    colony: '0x63987fbbd4634a34320d02f82ebf1c6017da9956e3c198ef2ac06bb346f64667',
};
var OrganizationFactory = /** @class */ (function () {
    function OrganizationFactory(pando) {
        this.pando = pando;
    }
    OrganizationFactory.prototype.deploy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var apm, factory, _a, _b, receipt, address, kernel, acl, _c, _d, colony, test;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        apm = apm_1.default(new web3_1.default(this.pando.options.ethereum.provider), {
                            ensRegistryAddress: this.pando.options.apm.ens,
                            ipfs: 'http://locahost:5001',
                        });
                        _b = (_a = this.pando.contracts.PandoKit).at;
                        return [4 /*yield*/, apm.getLatestVersionContract('pando-kit.aragonpm.eth')];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                    case 2:
                        factory = _e.sent();
                        return [4 /*yield*/, factory.newInstance()];
                    case 3:
                        receipt = _e.sent();
                        return [4 /*yield*/, this._getDAOAddressFromReceipt(receipt)];
                    case 4:
                        address = _e.sent();
                        console.log(address);
                        return [4 /*yield*/, this.pando.contracts.Kernel.at(address)];
                    case 5:
                        kernel = _e.sent();
                        _d = (_c = this.pando.contracts.ACL).at;
                        return [4 /*yield*/, kernel.acl()];
                    case 6: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                    case 7:
                        acl = _e.sent();
                        return [4 /*yield*/, this.pando.contracts.PandoColony.at(this._getColonyAddressFromReceipt(receipt))];
                    case 8:
                        colony = _e.sent();
                        return [4 /*yield*/, colony.ens()];
                    case 9:
                        test = _e.sent();
                        console.log(test);
                        return [2 /*return*/, new _1.default(this.pando, address, kernel, acl, colony)];
                }
            });
        });
    };
    OrganizationFactory.prototype._getDAOAddressFromReceipt = function (receipt) {
        return receipt.logs.filter(function (l) { return l.event === 'DeployInstance'; })[0].args.dao;
    };
    OrganizationFactory.prototype._getColonyAddressFromReceipt = function (receipt) {
        return receipt.logs.filter(function (l) { return l.event === 'InstalledApp' && l.args.appId === APP_IDS.colony; })[0].args.appProxy;
    };
    return OrganizationFactory;
}());
exports.default = OrganizationFactory;
//# sourceMappingURL=factory.js.map