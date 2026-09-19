"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateUser = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const response_js_1 = require("../utils/response.js");
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        (0, response_js_1.sendError)(res, "Authentication required. Please login.", 401);
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, jwt_js_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        (0, response_js_1.sendError)(res, "Invalid or expired token. Please login again.", 401);
    }
};
exports.authenticateUser = authenticateUser;
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_js_1.sendError)(res, "Authentication required.", 401);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_js_1.sendError)(res, `Access denied. Required role: [${roles.join(", ")}]. Current role: ${req.user.role}`, 403);
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
