"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts_error_1 = require("ts-error");
var PandoError = /** @class */ (function (_super) {
    __extends(PandoError, _super);
    function PandoError(code) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return _super.call(this, PandoError.message(code, args)) || this;
    }
    PandoError.message = function (code) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        switch (code) {
            case 'E_REPOSITORY_NOT_FOUND':
                return "No repository found at " + args[0];
            case 'E_FIBER_NOT_FOUND':
                return "Fiber " + args[0] + " not found";
            case 'E_NO_INDEX_ENTRY_FOUND':
                return "No file found at path " + args[0];
            default:
                return 'Unknown error';
        }
    };
    return PandoError;
}(ts_error_1.ExtendableError));
exports.default = PandoError;
//# sourceMappingURL=index.js.map