"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaclient = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth/auth.route"));
const express_oas_generator_1 = __importDefault(require("express-oas-generator"));
const checkout_route_1 = __importDefault(require("./routes/payments/checkout.route"));
const orders_route_1 = __importDefault(require("./routes/orders/orders.route"));
const app = (0, express_1.default)();
// Inicializar express-oas-generator antes de cualquier middleware
express_oas_generator_1.default.init(app, {});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
exports.prismaclient = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.get('/', (_req, res) => {
    res.send('API is running');
});
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use('/api', index_1.default);
app.use('/api/auth', auth_route_1.default);
app.use('/api/payments', checkout_route_1.default);
app.use('/api/orders', orders_route_1.default);
