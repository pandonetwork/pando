"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var truffle_contract_1 = __importDefault(require("truffle-contract"));
exports.artifacts = {
    acl: require('@aragon/os/build/contracts/ACL.json'),
    appProxyFactory: require('@aragon/os/build/contracts/AppProxyFactory.json'),
    appProxyUpgradeable: require('@aragon/os/build/contracts/AppProxyUpgradeable.json'),
    daoFactory: require('@aragon/os/build/contracts/DAOFactory.json'),
    kernel: require('@aragon/os/build/contracts/Kernel.json'),
    tree: require('@pando/core/build/contracts/Tree.json')
};
exports.acl = truffle_contract_1.default(exports.artifacts.acl);
exports.appProxyFactory = truffle_contract_1.default(exports.artifacts.appProxyFactory);
exports.appProxyUpgradeable = truffle_contract_1.default(exports.artifacts.appProxyUpgradeable);
exports.daoFactory = truffle_contract_1.default(exports.artifacts.daoFactory);
exports.kernel = truffle_contract_1.default(exports.artifacts.kernel);
exports.tree = truffle_contract_1.default(exports.artifacts.tree);
exports.initialize = function (web3, account) {
    var contracts = {};
    for (var artifact in exports.artifacts) {
        if (exports.artifacts.hasOwnProperty(artifact)) {
            contracts[artifact] = truffle_contract_1.default(exports.artifacts[artifact]);
            contracts[artifact].setProvider(web3.currentProvider);
            contracts[artifact].defaults({ from: account, gas: 100000000 });
        }
    }
    return contracts;
};
//# sourceMappingURL=contracts.js.map