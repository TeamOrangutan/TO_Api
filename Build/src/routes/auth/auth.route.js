"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_auth_1 = require("../../controllers/auth/login.auth");
const register_auth_1 = require("../../controllers/auth/register.auth");
const auth_google_1 = require("../../controllers/auth/auth.google");
const authRouter = (0, express_1.Router)();
// Rutas de autenticación
authRouter.post('/login', login_auth_1.login);
authRouter.post('/register', register_auth_1.register);
authRouter.post('/google', auth_google_1.googleAuth);
authRouter.post("/forgot-password", login_auth_1.requestPasswordReset);
authRouter.post("/reset-password/:token", login_auth_1.resetPassword);
exports.default = authRouter;
