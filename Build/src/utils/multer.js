"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// utils/multer.ts
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // <-- Esto es clave
exports.upload = (0, multer_1.default)({ storage });
