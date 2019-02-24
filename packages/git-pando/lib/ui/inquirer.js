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
var eth_provider_1 = __importDefault(require("eth-provider"));
var ora_1 = __importDefault(require("ora"));
var chalk_1 = __importDefault(require("chalk"));
var FRAME_ENDPOINT = 'ws://localhost:1248';
var FRAME_ORIGIN = 'AragonCLI';
var _url = function (configuration) {
    return configuration.ethereum.gateway.protocol + '://' + configuration.ethereum.gateway.host + ':' + configuration.ethereum.gateway.port;
};
var _timeout = function (duration) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                setTimeout(function () { resolve(); }, duration);
            })];
    });
}); };
var questions = {
    /* tslint:disable:object-literal-sort-keys */
    ethereum: {
        frame: {
            name: 'result',
            type: 'list',
            message: 'How do you want to connect to Ethereum',
            choices: ['Frame', 'Direct connection [requires an unlocked account]'],
            default: 'Frame',
        },
        gateway: {
            protocol: {
                name: 'result',
                type: 'list',
                message: 'Ethereum gateway protocol',
                choices: ['ws', 'ipc'],
                default: 'ws',
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
            },
        },
        account: function (accounts) {
            var question = {
                name: 'result',
                type: 'list',
                message: 'Ethereum account',
                choices: accounts,
                default: 0,
            };
            return question;
        },
    },
};
exports.prompt = {
    configure: function () { return __awaiter(_this, void 0, void 0, function () {
        var configuration, _a, _b, _c, _d, provider, message, spinner, accounts, _e, _f, _g, err_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    configuration = {
                        ethereum: {
                            connection: undefined,
                            account: undefined,
                            gateway: {
                                protocol: undefined,
                                host: undefined,
                                port: undefined,
                            },
                        },
                    };
                    _a = configuration.ethereum;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.frame)];
                case 1:
                    _a.connection = (_h.sent()).result === 'Frame' ? 'frame' : 'direct';
                    if (!(configuration.ethereum.connection !== 'frame')) return [3 /*break*/, 5];
                    _b = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.protocol)];
                case 2:
                    _b.protocol = (_h.sent()).result;
                    _c = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.host)];
                case 3:
                    _c.host = (_h.sent()).result;
                    _d = configuration.ethereum.gateway;
                    return [4 /*yield*/, inquirer.prompt(questions.ethereum.gateway.port)];
                case 4:
                    _d.port = (_h.sent()).result;
                    _h.label = 5;
                case 5:
                    provider = configuration.ethereum.connection === 'frame' ? eth_provider_1.default(FRAME_ENDPOINT) : eth_provider_1.default(_url(configuration));
                    message = configuration.ethereum.connection === 'frame' ? chalk_1.default.bold('Connecting to Frame') : chalk_1.default.bold('Connecting to Ethereum gateway');
                    spinner = ora_1.default(message).start();
                    _h.label = 6;
                case 6:
                    if (!true) return [3 /*break*/, 14];
                    _h.label = 7;
                case 7:
                    _h.trys.push([7, 11, , 13]);
                    return [4 /*yield*/, provider.send('eth_accounts')];
                case 8:
                    accounts = _h.sent();
                    spinner.stop();
                    _e = configuration.ethereum;
                    _g = (_f = inquirer).prompt;
                    return [4 /*yield*/, questions.ethereum.account(accounts)];
                case 9: return [4 /*yield*/, _g.apply(_f, [_h.sent()])];
                case 10:
                    _e.account = (_h.sent()).result;
                    return [3 /*break*/, 14];
                case 11:
                    err_1 = _h.sent();
                    spinner.text = message + ' ' + chalk_1.default.red(err_1.message);
                    return [4 /*yield*/, _timeout(2000)];
                case 12:
                    _h.sent();
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 6];
                case 14:
                    provider.connection.close();
                    return [2 /*return*/, configuration];
            }
        });
    }); },
};
exports.default = exports.prompt;
//# sourceMappingURL=inquirer.js.map