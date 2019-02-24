"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var nodegit_1 = __importDefault(require("nodegit"));
var path_1 = __importDefault(require("path"));
var truffle_contract_1 = __importDefault(require("truffle-contract"));
var web3_1 = __importDefault(require("web3"));
var level_1 = __importDefault(require("level"));
var ora_1 = __importDefault(require("ora"));
var jsonfile_1 = __importDefault(require("jsonfile"));
var os_1 = __importDefault(require("os"));
var line_helper_1 = __importDefault(require("./util/line-helper"));
var git_helper_1 = __importDefault(require("./util/git-helper"));
var ipld_helper_1 = __importDefault(require("./util/ipld-helper"));
var eth_provider_1 = __importDefault(require("eth-provider"));
var _timeout = function (duration) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                setTimeout(function () { resolve(); }, duration);
            })];
    });
}); };
var Helper = /** @class */ (function () {
    function Helper(name, url) {
        if (name === void 0) { name = '_'; }
        this.name = name;
        this.url = url;
        this.path = path_1.default.resolve(process.env.GIT_DIR);
        this.address = this.url.split('://')[1];
        this.config = this._config();
        this.debug = debug_1.default('pando');
        this.line = new line_helper_1.default();
        this.git = new git_helper_1.default(this);
        this.ipld = new ipld_helper_1.default();
    }
    Helper.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fs_extra_1.default.ensureDirSync(path_1.default.join(this.path, 'refs', 'remotes', this.name));
                        fs_extra_1.default.ensureDirSync(path_1.default.join(this.path, 'pando', 'refs'));
                        _a = this;
                        return [4 /*yield*/, nodegit_1.default.Repository.open(this.path)];
                    case 1:
                        _a._repo = _d.sent();
                        this._db = level_1.default(path_1.default.join(this.path, 'pando', 'refs', this.address));
                        _b = this;
                        return [4 /*yield*/, this._ethConnect()];
                    case 2:
                        _b._provider = _d.sent();
                        this._web3 = new web3_1.default(this._provider);
                        this._artifact = truffle_contract_1.default(require('@pando/repository/build/contracts/PandoRepository.json'));
                        this._artifact.setProvider(this._provider);
                        this._artifact.defaults({ gas: 30e6, gasPrice: 15000000001, from: this.config.ethereum.account });
                        _c = this;
                        return [4 /*yield*/, this._artifact.at(this.address)];
                    case 3:
                        _c._contract = _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Helper.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.line.next()];
                    case 1:
                        cmd = _b.sent();
                        _a = this._cmd(cmd);
                        switch (_a) {
                            case 'capabilities': return [3 /*break*/, 2];
                            case 'list for-push': return [3 /*break*/, 4];
                            case 'list': return [3 /*break*/, 6];
                            case 'fetch': return [3 /*break*/, 8];
                            case 'push': return [3 /*break*/, 10];
                            case 'end': return [3 /*break*/, 12];
                            case 'unknown': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, this._handleCapabilities()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 4: return [4 /*yield*/, this._handleList({ forPush: true })];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 6: return [4 /*yield*/, this._handleList()];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 8: return [4 /*yield*/, this._handleFetch(cmd)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 10: return [4 /*yield*/, this._handlePush(cmd)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        this._exit();
                        _b.label = 13;
                    case 13:
                        this._die('unknown command: ' + cmd);
                        _b.label = 14;
                    case 14: return [3 /*break*/, 0];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /***** command handling methods *****/
    Helper.prototype._handleCapabilities = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.debug('capabilities');
                // this._send('option')
                this._send('fetch');
                this._send('push');
                this._send('');
                return [2 /*return*/];
            });
        });
    };
    Helper.prototype._handleList = function (_a) {
        var _b = (_a === void 0 ? {} : _a).forPush, forPush = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var refs, ref;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        forPush ? this.debug('list', 'for-push') : this.debug('list');
                        return [4 /*yield*/, this._fetchRefs()];
                    case 1:
                        refs = _c.sent();
                        for (ref in refs) {
                            this._send(this.ipld.cidToSha(refs[ref]) + ' ' + ref);
                        }
                        this._send('');
                        return [2 /*return*/];
                }
            });
        });
    };
    Helper.prototype._handleFetch = function (line) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cmd, oid, name_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.debug(line);
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 4];
                        _a = line.split(' '), cmd = _a[0], oid = _a[1], name_1 = _a[2];
                        return [4 /*yield*/, this._fetch(oid, name_1)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.line.next()];
                    case 3:
                        line = _b.sent();
                        if (line === '') {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 1];
                    case 4:
                        this._send('');
                        return [2 /*return*/];
                }
            });
        });
    };
    Helper.prototype._handlePush = function (line) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, src, dst;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.debug(line);
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 7];
                        _a = line.split(' ')[1].split(':'), src = _a[0], dst = _a[1];
                        if (!(src === '')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._delete(dst)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this._push(src, dst)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [4 /*yield*/, this.line.next()];
                    case 6:
                        line = _b.sent();
                        if (line === '') {
                            return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 1];
                    case 7:
                        this._send('');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**********/
    Helper.prototype._fetchRefs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var start, block, events, ops, updates, err_1, _i, events_1, event_1, ref;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.debug('fetching refs');
                        ops = [];
                        updates = {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._db.get('@block')];
                    case 2:
                        start = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        if (err_1.message === 'Key not found in database [@block]') {
                            start = 0;
                        }
                        else {
                            throw err_1;
                        }
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this._web3.eth.getBlockNumber()];
                    case 5:
                        block = _a.sent();
                        return [4 /*yield*/, this._contract.getPastEvents('UpdateRef', { fromBlock: start, toBlock: 'latest' })];
                    case 6:
                        events = _a.sent();
                        for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                            event_1 = events_1[_i];
                            updates[event_1.args.ref] = event_1.args.hash;
                        }
                        for (ref in updates) {
                            ops.push({ type: 'put', key: ref, value: updates[ref] });
                        }
                        ops.push({ type: 'put', key: '@block', value: block });
                        return [4 /*yield*/, this._db.batch(ops)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this._getRefs()];
                    case 8: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Helper.prototype._getRefs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refs;
            var _this = this;
            return __generator(this, function (_a) {
                refs = {};
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._db.createReadStream()
                            .on('data', function (ref) {
                            if (ref.key !== '@block')
                                refs[ref.key] = ref.value;
                        })
                            .on('error', function (err) {
                            reject(err);
                        })
                            .on('end', function () {
                            //
                        })
                            .on('close', function () {
                            resolve(refs);
                        });
                    })];
            });
        });
    };
    /***** core methods *****/
    Helper.prototype._fetch = function (oid, ref) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.debug('fetching', oid, this.ipld.shaToCid(oid), ref);
                        return [4 /*yield*/, this.git.download(oid)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Helper.prototype._push = function (src, dst) {
        return __awaiter(this, void 0, void 0, function () {
            var spinner, head, mapping, ops, refs, remote, oid, revwalk, commits, _a, _b, _i, id, _c, _cid, _node, _mapping, _d, _e, _f, entry, _g;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        this.debug('pushing', src, 'to', dst);
                        mapping = {};
                        ops = [];
                        return [4 /*yield*/, this._getRefs()];
                    case 1:
                        refs = _h.sent();
                        remote = refs[dst];
                        return [4 /*yield*/, nodegit_1.default.Reference.nameToId(this._repo, src)];
                    case 2:
                        oid = _h.sent();
                        revwalk = nodegit_1.default.Revwalk.create(this._repo);
                        revwalk.pushRef(src);
                        return [4 /*yield*/, revwalk.getCommitsUntil(function (commit) {
                                if (typeof remote === 'undefined')
                                    return true;
                                return (commit.id().tostrS() !== _this.ipld.cidToSha(remote));
                            })
                            // collecting git objects
                        ];
                    case 3:
                        commits = _h.sent();
                        // collecting git objects
                        spinner = ora_1.default('collecting git objects').start();
                        _a = [];
                        for (_b in commits)
                            _a.push(_b);
                        _i = 0;
                        _h.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        id = _a[_i];
                        return [4 /*yield*/, this.git.collect(commits[id].sha())];
                    case 5:
                        _c = _h.sent(), _cid = _c[0], _node = _c[1], _mapping = _c[2];
                        mapping = __assign({}, mapping, _mapping);
                        if (id === '0')
                            head = _cid;
                        _h.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        _d = [];
                        for (_e in mapping)
                            _d.push(_e);
                        _f = 0;
                        _h.label = 8;
                    case 8:
                        if (!(_f < _d.length)) return [3 /*break*/, 11];
                        entry = _d[_f];
                        _g = ops.push;
                        return [4 /*yield*/, this.ipld.put(mapping[entry])];
                    case 9:
                        _g[_h.sent()];
                        _h.label = 10;
                    case 10:
                        _f++;
                        return [3 /*break*/, 8];
                    case 11:
                        spinner.succeed('git objects collected');
                        // pushing git objects to IPFS
                        spinner = ora_1.default('pushing git objects to IPFS').start();
                        return [4 /*yield*/, Promise.all(ops)];
                    case 12:
                        _h.sent();
                        spinner.succeed('git objects pushed to IPFS');
                        spinner = ora_1.default("pushing ref " + dst + " on-chain").start();
                        return [4 /*yield*/, this._contract.setRef(dst, head)];
                    case 13:
                        _h.sent();
                        spinner.succeed("ref " + dst + " pushed on-chain");
                        this._send("error " + dst + " push command converted into Request For Commit");
                        return [2 /*return*/];
                }
            });
        });
    };
    Helper.prototype._delete = function (dst) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.debug('deleting', dst);
                return [2 /*return*/];
            });
        });
    };
    /***** utility methods *****/
    Helper.prototype._ethConnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var provider, message, spinner, accounts, _i, accounts_1, account, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.config.ethereum.connection === 'frame' ? eth_provider_1.default('ws://localhost:1248') : eth_provider_1.default(this._url(this.config.ethereum));
                        message = this.config.ethereum.connection === 'frame' ? 'Connecting to Frame' : 'Connecting to Ethereum gateway';
                        spinner = ora_1.default(message).start();
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 9];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 8]);
                        return [4 /*yield*/, provider.send('eth_accounts')];
                    case 3:
                        accounts = _a.sent();
                        spinner.stop();
                        for (_i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
                            account = accounts_1[_i];
                            if (account === this.config.ethereum.account)
                                return [2 /*return*/, provider];
                        }
                        this._die("Your Ethereum gateway does not handle your Ethereum account. Update your gateway configuration or run 'git pando config' to select another account.");
                        return [3 /*break*/, 8];
                    case 4:
                        err_2 = _a.sent();
                        if (!(err_2.code === 4100 || err_2.code === 4001)) return [3 /*break*/, 6];
                        spinner.text = message + ': ' + err_2.message;
                        return [4 /*yield*/, _timeout(2000)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        spinner.stop();
                        this._die('Cannot connect to Ethereum. Make sure your Ethereum gateway is running.');
                        _a.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, provider];
                }
            });
        });
    };
    Helper.prototype._url = function (configuration) {
        return configuration.gateway.protocol + '://' + configuration.gateway.host + ':' + configuration.gateway.port;
    };
    Helper.prototype._config = function () {
        var LOCAL = path_1.default.join(this.path, 'pando', 'pandorc');
        var GLOBAL = path_1.default.join(os_1.default.homedir(), '.pandorc');
        if (fs_extra_1.default.pathExistsSync(LOCAL))
            return jsonfile_1.default.readFileSync(LOCAL);
        if (fs_extra_1.default.pathExistsSync(GLOBAL))
            return jsonfile_1.default.readFileSync(GLOBAL);
        this._die("No configuration file found. Run 'git-pando config' and come back to us.");
    };
    Helper.prototype._cmd = function (line) {
        if (line === 'capabilities') {
            return 'capabilities';
        }
        else if (line === 'list for-push') {
            return 'list for-push';
        }
        else if (line === 'list') {
            return 'list';
        }
        else if (line.startsWith('option')) {
            return 'option';
        }
        else if (line.startsWith('fetch')) {
            return 'fetch';
        }
        else if (line.startsWith('push')) {
            return 'push';
        }
        else if (line === '') {
            return 'end';
        }
        else {
            return 'unknown';
        }
    };
    Helper.prototype._send = function (message) {
        console.log(message);
    };
    Helper.prototype._die = function (message) {
        console.error(message);
        process.exit(1);
    };
    Helper.prototype._exit = function () {
        process.exit(0);
    };
    return Helper;
}());
exports.default = Helper;
//# sourceMappingURL=helper.js.map