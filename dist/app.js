"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = require("./config/index.js");
const errorHandler_js_1 = require("./middlewares/errorHandler.js");
// Import Society Management routers
const routes_js_1 = __importDefault(require("./modules/auth/routes.js"));
const routes_js_2 = __importDefault(require("./modules/society/routes.js"));
const routes_js_3 = __importDefault(require("./modules/flats/routes.js"));
const routes_js_4 = __importDefault(require("./modules/residents/routes.js"));
const routes_js_5 = __importDefault(require("./modules/maintenance/routes.js"));
const routes_js_6 = __importDefault(require("./modules/payments/routes.js"));
const routes_js_7 = __importDefault(require("./modules/ledger/routes.js"));
const routes_js_8 = __importDefault(require("./modules/visitors/routes.js"));
const routes_js_9 = __importDefault(require("./modules/complaints/routes.js"));
const routes_js_10 = __importDefault(require("./modules/announcements/routes.js"));
const routes_js_11 = __importDefault(require("./modules/expenses/routes.js"));
const routes_js_12 = __importDefault(require("./modules/reports/routes.js"));
const routes_js_13 = __importDefault(require("./modules/dashboard/routes.js"));
const routes_js_14 = __importDefault(require("./modules/staff/routes.js"));
// Legacy module routers for backwards compatibility
const routes_js_15 = __importDefault(require("./modules/rooms/routes.js"));
const routes_js_16 = __importDefault(require("./modules/guests/routes.js"));
const routes_js_17 = __importDefault(require("./modules/stays/routes.js"));
const routes_js_18 = __importDefault(require("./modules/bills/routes.js"));
const app = (0, express_1.default)();
// Security and utility middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [index_js_1.config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        app: "Green Garden Residential Society Management API",
        version: "2.0.0",
        timestamp: new Date(),
    });
});
// Society Management API Routes
app.use("/api/auth", routes_js_1.default);
app.use("/api/society", routes_js_2.default);
app.use("/api/flats", routes_js_3.default);
app.use("/api/residents", routes_js_4.default);
app.use("/api/maintenance", routes_js_5.default);
app.use("/api/payments", routes_js_6.default);
app.use("/api/ledger", routes_js_7.default);
app.use("/api/visitors", routes_js_8.default);
app.use("/api/complaints", routes_js_9.default);
app.use("/api/announcements", routes_js_10.default);
app.use("/api/expenses", routes_js_11.default);
app.use("/api/reports", routes_js_12.default);
app.use("/api/dashboard", routes_js_13.default);
app.use("/api/staff", routes_js_14.default);
// Legacy routes preserved during migration
app.use("/api/rooms", routes_js_15.default);
app.use("/api/guests", routes_js_16.default);
app.use("/api/stays", routes_js_17.default);
app.use("/api/bills", routes_js_18.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
