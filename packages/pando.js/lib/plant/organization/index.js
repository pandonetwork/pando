"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var factory_1 = __importDefault(require("./organism/factory"));
var APP_IDS = {
    'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
    'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
    'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
};
var Organization = /** @class */ (function () {
    function Organization(plant, address, kernel, acl, colony, scheme) {
        this.plant = plant;
        this.address = address;
        this.kernel = kernel;
        this.acl = acl;
        this.colony = colony;
        this.scheme = scheme;
        this.organisms = new factory_1.default(this);
    }
    return Organization;
}());
exports.default = Organization;
//# sourceMappingURL=index.js.map