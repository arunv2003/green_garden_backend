"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const index_js_2 = require("./db/index.js");
async function bootstrap() {
    try {
        console.log("Checking database connection and schema...");
        try {
            await (0, index_js_2.ensureDatabaseExists)();
        }
        catch (dbErr) {
            console.warn("Database ensure warning (will attempt direct pool connection):", dbErr.message);
        }
        const [rows] = await index_js_2.poolConnection.query("SELECT 1 as connected");
        console.log("MySQL connection successfully established.");
        app_js_1.default.listen(index_js_1.config.port, () => {
            console.log(`=========================================`);
            console.log(`🌱 GREEN GARDEN BACKEND SERVER RUNNING`);
            console.log(`🚀 Port: ${index_js_1.config.port}`);
            console.log(`🌐 URL: http://localhost:${index_js_1.config.port}`);
            console.log(`📋 Health: http://localhost:${index_js_1.config.port}/api/health`);
            console.log(`=========================================`);
        });
    }
    catch (err) {
        console.error("Failed to start Green Garden backend:", err);
        process.exit(1);
    }
}
bootstrap();
