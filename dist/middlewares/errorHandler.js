"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_js_1 = require("../utils/response.js");
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled Error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    (0, response_js_1.sendError)(res, message, statusCode, err.stack);
};
exports.errorHandler = errorHandler;
