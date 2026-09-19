"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwtSecret, {
        expiresIn: index_js_1.config.jwtExpiresIn,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
};
exports.verifyToken = verifyToken;
