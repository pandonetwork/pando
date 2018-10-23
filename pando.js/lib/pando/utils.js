"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var truffle_hdwallet_provider_1 = __importDefault(require("truffle-hdwallet-provider"));
var web3_1 = __importDefault(require("web3"));
web3_1.default.providers.HttpProvider.prototype.sendAsync =
    web3_1.default.providers.HttpProvider.prototype.send;
exports.web3 = {
    get: function (opts) {
        if (opts.gateway) {
            if (opts.mnemonic) {
                var provider = new truffle_hdwallet_provider_1.default(opts.mnemonic, opts.gateway);
                return new web3_1.default(provider);
            }
            else {
                return new web3_1.default(new web3_1.default.providers.HttpProvider(opts.gateway));
            }
        }
        else {
            throw new Error('Please specify a web3 provider');
            // Handle the case for Mist/Metamask in browser web3 injection
            // See gnosis.js Gnosis.setWeb3Provider() method for inspiration
        }
    }
};
//# sourceMappingURL=utils.js.map