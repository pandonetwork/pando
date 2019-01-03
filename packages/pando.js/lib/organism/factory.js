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
var _1 = __importDefault(require("."));
var OrganismFactory = /** @class */ (function () {
    function OrganismFactory(pando) {
        this.pando = pando;
    }
    OrganismFactory.prototype.deploy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new _1.default('0x00')
                    // const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
                    // // DAO
                    // const receipt_1 = await factory.newDAO(root)
                    // const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
                    // const acl       = await ACL.at(await dao.acl())
                    // await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
                    // // Genesis
                    // const receipt_2 = await dao.newAppInstance('0x0001', (await PandoGenesis.new()).address, { from: root })
                    // const genesis   = await PandoGenesis.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
                    // await genesis.initialize()
                    // // Lineage
                    // const receipt_3 = await dao.newAppInstance('0x0002', (await PandoLineage.new()).address, { from: root })
                    // const lineage   = await PandoLineage.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
                    // await token.changeController(lineage.address)
                    // await lineage.initialize(token.address)
                    // // API
                    // const receipt_4 = await dao.newAppInstance('0x0003', (await PandoAPI.new()).address, { from: root })
                    // const api       = await PandoAPI.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
                    // await acl.createPermission(api.address, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
                    // await acl.createPermission(api.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
                    // await acl.createPermission(api.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })
                    // await acl.createPermission(authorized, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
                    // await acl.createPermission(authorized, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
                    // await acl.createPermission(authorized, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
                    // await acl.createPermission(authorized, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
                    // await acl.createPermission(authorized, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })
                    // await api.initialize(genesis.address, lineage.address, { from: root })
                    //
                    // return { dao, token, genesis, lineage, api }
                ];
            });
        });
    };
    return OrganismFactory;
}());
exports.default = OrganismFactory;
//# sourceMappingURL=factory.js.map