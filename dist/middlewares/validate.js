"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const response_js_1 = require("../utils/response.js");
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
                (0, response_js_1.sendError)(res, `Validation error: ${errorMessages}`, 400, error.errors);
                return;
            }
            (0, response_js_1.sendError)(res, "Invalid request data", 400);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            req.query = await schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
                (0, response_js_1.sendError)(res, `Validation error: ${errorMessages}`, 400, error.errors);
                return;
            }
            (0, response_js_1.sendError)(res, "Invalid query parameters", 400);
        }
    };
};
exports.validateQuery = validateQuery;
