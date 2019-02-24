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
var lodash_1 = __importDefault(require("lodash"));
var truffle_contract_1 = __importDefault(require("truffle-contract"));
var web3_1 = __importDefault(require("web3"));
var factory_1 = __importDefault(require("./organization/factory"));
var error_1 = __importDefault(require("./error"));
var _artifacts = ['Kernel', 'ACL', 'PandoKit', 'PandoColony', 'PandoRepository'].map(function (name) {
    switch (name) {
        case 'PandoKit':
            return require("@pando/kit/build/contracts/" + name + ".json");
        case 'PandoColony':
            return require("@pando/colony/build/contracts/" + name + ".json");
        case 'PandoRepository':
            return require("@pando/repository/build/contracts/" + name + ".json");
        default:
            return require("@aragon/os/build/contracts/" + name + ".json");
    }
});
var _providerFromGateway = function (gateway) {
    switch (gateway.protocol) {
        case 'ws':
            return new web3_1.default.providers.WebsocketProvider('ws://' + gateway.host + ':' + gateway.port);
        case 'http':
            throw new error_1.default('E_DEPRECATED_PROVIDER_PROTOCOL', gateway.protocol);
        default:
            throw new error_1.default('E_UNKNOWN_PROVIDER_PROTOCOL', gateway.protocol);
    }
};
var _defaults = function (options) {
    var apm = lodash_1.default.defaultsDeep(options.apm, { ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' });
    var gateway = lodash_1.default.defaultsDeep(options.ethereum.gateway, { protocol: 'ws', host: 'localhost', port: '8545' });
    var provider = typeof options.ethereum.provider !== 'undefined' ? options.ethereum.provider : _providerFromGateway(gateway);
    return { ethereum: { account: options.ethereum.account, provider: provider }, apm: apm };
};
var Pando = /** @class */ (function () {
    function Pando(options) {
        this.options = options;
        this.organizations = new factory_1.default(this);
        this.contracts = Object.assign.apply(Object, [{}].concat(_artifacts.map(function (artifact) { return truffle_contract_1.default(artifact); }).map(function (contract) {
            var _a;
            return (_a = {}, _a[contract._json.contractName] = contract, _a);
        })));
    }
    Pando.create = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var pando;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pando = new Pando(_defaults(options));
                        return [4 /*yield*/, pando._initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, pando];
                }
            });
        });
    };
    Pando.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof this.options.ethereum.provider.connection !== 'undefined') {
                    this.options.ethereum.provider.connection.close();
                }
                return [2 /*return*/];
            });
        });
    };
    Pando.prototype._initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                for (contract in this.contracts) {
                    if (this.contracts.hasOwnProperty(contract)) {
                        this.contracts[contract].setProvider(this.options.ethereum.provider);
                        this.contracts[contract].defaults({ from: this.options.ethereum.account, gas: 30e6, gasPrice: 15000000001 });
                    }
                }
                return [2 /*return*/, this];
            });
        });
    };
    return Pando;
}());
exports.default = Pando;
//# sourceMappingURL=pando.js.map