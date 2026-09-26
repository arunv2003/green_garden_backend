"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.poolConnection = exports.dbConfig = void 0;
exports.ensureDatabaseExists = ensureDatabaseExists;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const index_js_1 = require("../config/index.js");
const schema = __importStar(require("./schema/index.js"));
const parseDbConfig = () => {
    if (process.env.DB_USER && process.env.DB_PASSWORD !== undefined) {
        return {
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "3306", 10),
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "green_garden",
        };
    }
    try {
        const parsed = new URL(index_js_1.config.databaseUrl);
        const dbName = parsed.pathname.replace("/", "");
        return {
            host: parsed.hostname || "localhost",
            port: parseInt(parsed.port || "3306", 10),
            user: parsed.username ? decodeURIComponent(parsed.username) : "root",
            password: parsed.password ? decodeURIComponent(parsed.password) : "",
            database: dbName || "green_garden",
        };
    }
    catch (err) {
        return {
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "green_garden",
        };
    }
};
exports.dbConfig = parseDbConfig();
const isRemoteHost = exports.dbConfig.host !== "localhost" && exports.dbConfig.host !== "127.0.0.1";
const sslConfig = isRemoteHost ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;
exports.poolConnection = promise_1.default.createPool({
    host: exports.dbConfig.host,
    port: exports.dbConfig.port,
    user: exports.dbConfig.user,
    password: exports.dbConfig.password,
    database: exports.dbConfig.database,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.db = (0, mysql2_1.drizzle)(exports.poolConnection, { schema, mode: "default" });
async function ensureDatabaseExists() {
    const { host, port, user, password, database } = exports.dbConfig;
    const isRemote = host !== "localhost" && host !== "127.0.0.1";
    const connection = await promise_1.default.createConnection({
        host,
        port,
        user,
        password,
        ssl: isRemote ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    });
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log(`Database '${database}' verified/created.`);
    }
    finally {
        await connection.end();
    }
}
