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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = __importStar(require("inquirer"));
var web3_1 = __importDefault(require("web3"));
var _provider = function (configuration) {
    var url = configuration.ethereum.gateway.protocol +
        '://' +
        configuration.ethereum.gateway.host +
        ':' +
        configuration.ethereum.gateway.port;
    return new web3_1.default.providers.WebsocketProvider(url);
};
var questions = {
    /* tslint:disable:object-literal-sort-keys */
    ethereum: {
        gateway: {
            protocol: {
                name: 'result',
                type: 'list',
                message: 'Ethereum gateway protocol',
                choices: ['ws', 'ipc'],
                default: 'ws'
            },
            host: {
                name: 'result',
                type: 'input',
                message: 'Ethereum gateway host',
                default: 'localhost',
            },
            port: {
                name: 'result',
                type: 'input',
                message: 'Ethereum gateway port',
                default: '8545',
            }
        },
        account: function (provider) { return __awaiter(_this, void 0, void 0, function () {
            var question;
            var _this = this;
            return __generator(this, function (_a) {
                question = {
                    name: 'result',
                    type: 'list',
                    message: 'Ethereum account',
                    choices: function () { return __awaiter(_this, void 0, void 0, function () {
                        var web3, accounts;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    web3 = new web3_1.default(provider);
                                    return [4 /*yield*/, web3.eth.getAccounts()];
                                case 1:
                                    accounts = _a.sent();
                                    return [2 /*return*/, accounts];
                            }
                        });
                    }); },
                    default: 0
                };
                return [2 /*return*/, question];
            });
        }); }
    }
};
exports.prompt = {
    configure: function () { return __awaiter(_this, void 0, void 0, function () {
        var configuration, _a, _b, _c, provider, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    configuration = {
                        ethereum: {
                            account: undefined,
                            gateway: {
                                protocol: undefined,
                                host: undefined,
                                port: undefined
                            }
                        }
                    };
                    _a = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.protocol)];
                case 1:
                    _a.protocol = (_g.sent()).result;
                    _b = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.host)];
                case 2:
                    _b.host = (_g.sent()).result;
                    _c = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.port)];
                case 3:
                    _c.port = (_g.sent()).result;
                    provider = _provider(configuration);
                    _d = configuration.ethereum;
                    _f = (_e = inquirer).prompt;
                    return [4 /*yield*/, questions.ethereum.account(provider)];
                case 4: return [4 /*yield*/, _f.apply(_e, [_g.sent()])];
                case 5:
                    _d.account = (_g.sent()).result;
                    provider.connection.close();
                    return [2 /*return*/, configuration];
            }
        });
    }); }
};
/* tslint:enable:object-literal-sort-keys */
exports.default = exports.prompt;
//# sourceMappingURL=inquirer.js.map