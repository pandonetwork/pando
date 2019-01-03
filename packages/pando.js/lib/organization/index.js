"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APP_IDS = {
    'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
    'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
};
var Organization = /** @class */ (function () {
    function Organization(pando, kernel, acl) {
        this.pando = pando;
        this.kernel = kernel;
        this.acl = acl;
        // console.log(kernel)
        // Initialises the wrapper and logs the installed apps
    }
    return Organization;
}());
exports.default = Organization;
//# sourceMappingURL=index.js.map