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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var pando_js_1 = __importDefault(require("@pando/pando.js"));
var chalk_1 = __importDefault(require("chalk"));
var ora_1 = __importDefault(require("ora"));
var yargs_1 = __importDefault(require("yargs"));
var builder = function () {
    return yargs_1.default
        .option('organization', {
        alias: 'o',
        description: 'The organization to deploy the organism in',
        required: true,
    })
        .help()
        .strict(false)
        .version(false);
};
var handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var pando, spinner, plant, organization, organism, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                spinner = ora_1.default(chalk_1.default.dim("Deploying organism '" + argv.name + "'")).start();
                return [4 /*yield*/, pando_js_1.default.create(argv.configuration)];
            case 1:
                pando = _a.sent();
                return [4 /*yield*/, pando.plants.load()];
            case 2:
                plant = _a.sent();
                return [4 /*yield*/, plant.organizations.load({ name: argv.organization })];
            case 3:
                organization = _a.sent();
                return [4 /*yield*/, organization.organisms.deploy(argv.name)];
            case 4:
                organism = _a.sent();
                spinner.succeed(chalk_1.default.dim("Organism '" + argv.name + "' deployed at address " + organism.address));
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                spinner.fail(chalk_1.default.dim(err_1.message));
                return [3 /*break*/, 6];
            case 6: return [4 /*yield*/, pando.close()];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/* tslint:disable:object-literal-sort-keys */
exports.deploy = {
    command: 'deploy <name>',
    desc: 'Deploy a new organism',
    builder: builder,
    handler: handler,
};
/* tslint:enable:object-literal-sort-keys */
//# sourceMappingURL=deploy.js.map