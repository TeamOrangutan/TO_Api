"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaProduct = void 0;
const zod_1 = require("zod");
exports.schemaProduct = zod_1.z.object({
    name: zod_1.z.string(),
    categoryId: zod_1.z.number()
});
