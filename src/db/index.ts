import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "../config/index.js";
import * as schema from "./schema/index.js";

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
    const parsed = new URL(config.databaseUrl);
    const dbName = parsed.pathname.replace("/", "");
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "3306", 10),
      user: parsed.username ? decodeURIComponent(parsed.username) : "root",
      password: parsed.password ? decodeURIComponent(parsed.password) : "",
      database: dbName || "green_garden",
    };
  } catch (err) {
    return {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "green_garden",
    };
  }
};

export const dbConfig = parseDbConfig();

const isRemoteHost = dbConfig.host !== "localhost" && dbConfig.host !== "127.0.0.1";
const sslConfig = isRemoteHost ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;

export const poolConnection = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });

export async function ensureDatabaseExists() {
  const { host, port, user, password, database } = dbConfig;
  const isRemote = host !== "localhost" && host !== "127.0.0.1";
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    ssl: isRemote ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Database '${database}' verified/created.`);
  } finally {
    await connection.end();
  }
}
