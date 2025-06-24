"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const store_route_1 = __importDefault(require("../routes/store/store.route"));
const invoice_route_1 = __importDefault(require("../routes/store/invoice.route"));
const user_route_1 = __importDefault(require("../routes/user/user.route"));
const stats_route_1 = __importDefault(require("../routes/stats/stats.route"));
const AppProduct = express_1.default.Router();
AppProduct.use("/products", store_route_1.default);
AppProduct.use("/invoices", invoice_route_1.default);
AppProduct.use("/user", user_route_1.default);
AppProduct.use("/stats", stats_route_1.default);
exports.default = AppProduct;
