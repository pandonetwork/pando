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
var ethers_1 = __importDefault(require("ethers"));
var ContractFactory = /** @class */ (function () {
    function ContractFactory(artifact) {
        // super()
        this.artifact = artifact;
        this.interface = new ethers_1.default.Interface(artifact.abi);
    }
    ContractFactory.prototype.deploy = function (signer) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, _a, tx, address, instance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        args = [this.artifact.bytecode, this.artifact.abi].concat(args);
                        transaction = ethers_1.default.Contract.getDeployTransaction.apply(null, args);
                        _a = transaction;
                        return [4 /*yield*/, signer.estimateGas(transaction)];
                    case 1:
                        _a.gasLimit = _b.sent();
                        return [4 /*yield*/, signer.sendTransaction(transaction)];
                    case 2:
                        tx = _b.sent();
                        process.emit('waiting', tx.hash);
                        // console.log('Waiting for transaction ' + tx.hash + ' to be mined')
                        return [4 /*yield*/, signer.provider.waitForTransaction(tx.hash)];
                    case 3:
                        // console.log('Waiting for transaction ' + tx.hash + ' to be mined')
                        _b.sent();
                        process.emit('mined', tx.hash);
                        address = ethers_1.default.utils.getContractAddress(tx);
                        instance = new ethers_1.default.Contract(address, this.artifact.abi, signer);
                        instance.$emit = this.constructor.prototype.emit;
                        console.log(instance.$emit);
                        // console.log('Factory: ' + factoryAddress)
                        return [2 /*return*/, { instance: instance, tx: tx }];
                }
            });
        });
    };
    ContractFactory.prototype.extractEvent = function (provider, event, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, topic, log, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.getTransactionReceipt(tx.hash)
                        // console.log(receipt)
                    ];
                    case 1:
                        receipt = _a.sent();
                        topic = this.interface.events[event].topics[0];
                        log = receipt.logs.filter(function (l) { return l.topics[0] === topic; })[0];
                        data = this.interface.events[event].parse(this.interface.events[event].topics, log.data);
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return ContractFactory;
}());
exports.default = ContractFactory;
// public async deploy(signer: any): Promise<any> {
//   const transaction = ethers.Contract.getDeployTransaction(
//     Kernel.artifact.bytecode,
//     Kernel.artifact.abi
//   )
//   transaction.gasLimit = await signer.estimateGas(transaction)
//   const tx = await signer.sendTransaction(transaction)
//   const address = ethers.utils.getContractAddress(tx)
//   const kernel = new ethers.Contract(address, Kernel.artifact.abi, signer)
//   // console.log('Factory: ' + factoryAddress)
//   return { kernel, tx }
// }
//
// public async at(signer: any): Promise<any> {
//   const transaction = ethers.Contract.getDeployTransaction(
//     Kernel.artifact.bytecode,
//     Kernel.artifact.abi
//   )
//   transaction.gasLimit = await signer.estimateGas(transaction)
//   const tx = await signer.sendTransaction(transaction)
//   const address = ethers.utils.getContractAddress(tx)
//   const kernel = new ethers.Contract(address, Kernel.artifact.abi, signer)
//   // console.log('Factory: ' + factoryAddress)
//   return { kernel, tx }
// }
var Kernel = new ContractFactory(require('@aragon/os/build/contracts/Kernel.json'));
exports.Kernel = Kernel;
var ACL = new ContractFactory(require('@aragon/os/build/contracts/ACL.json'));
exports.ACL = ACL;
var DAOFactory = new ContractFactory(require('@aragon/os/build/contracts/DAOFactory.json'));
exports.DAOFactory = DAOFactory;
//# sourceMappingURL=index.js.map