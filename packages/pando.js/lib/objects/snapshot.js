"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var ipld_node_1 = __importDefault(require("./ipld-node"));
var Snapshot = /** @class */ (function (_super) {
    __extends(Snapshot, _super);
    function Snapshot(data, opts) {
        var _this = _super.call(this, 'snapshot') || this;
        _this.author = data.author;
        _this.tree = data.tree;
        _this.parents = data.parents || [];
        _this.message = data.message;
        _this.timestamp = data.timestamp || Date.now();
        return _this;
    }
    Snapshot.prototype.toIPLD = function () {
        return __awaiter(this, void 0, void 0, function () {
            var node, _a, _b, _c, _i, _d, parent_1, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        node = {};
                        node['@type'] = this.type;
                        node.timestamp = this.timestamp;
                        node.author = this.author;
                        node.message = this.message;
                        _a = node;
                        _b = {};
                        _c = '/';
                        return [4 /*yield*/, this.tree.cid()];
                    case 1:
                        _a.tree = (_b[_c] = (_j.sent()).toBaseEncodedString(), _b);
                        node.parents = [];
                        _i = 0, _d = this.parents;
                        _j.label = 2;
                    case 2:
                        if (!(_i < _d.length)) return [3 /*break*/, 5];
                        parent_1 = _d[_i];
                        _f = (_e = node.parents).push;
                        _g = {};
                        _h = '/';
                        return [4 /*yield*/, parent_1.cid()];
                    case 3:
                        _f.apply(_e, [(_g[_h] = (_j.sent()).toBaseEncodedString(), _g)]);
                        _j.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, node];
                }
            });
        });
    };
    Snapshot.prototype.put = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var ipldNode, _i, _a, parent_2, cid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.toIPLD()];
                    case 1:
                        ipldNode = _b.sent();
                        return [4 /*yield*/, this.tree.put(node)];
                    case 2:
                        _b.sent();
                        _i = 0, _a = this.parents;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        parent_2 = _a[_i];
                        return [4 /*yield*/, parent_2.put(node)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, node.put(ipldNode)];
                    case 7:
                        cid = _b.sent();
                        return [2 /*return*/, cid.toBaseEncodedString()];
                }
            });
        });
    };
    return Snapshot;
}(ipld_node_1.default));
exports.default = Snapshot;
//# sourceMappingURL=snapshot.js.map