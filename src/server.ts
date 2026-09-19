import app from "./app.js";
import { config } from "./config/index.js";
import { ensureDatabaseExists, poolConnection } from "./db/index.js";

async function bootstrap() {
  try {
    console.log("Checking database connection and schema...");
    try {
      await ensureDatabaseExists();
    } catch (dbErr: any) {
      console.warn("Database ensure warning (will attempt direct pool connection):", dbErr.message);
    }

    const [rows] = await poolConnection.query("SELECT 1 as connected");
    console.log("MySQL connection successfully established.");

    app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(`🌱 GREEN GARDEN BACKEND SERVER RUNNING`);
      console.log(`🚀 Port: ${config.port}`);
      console.log(`🌐 URL: http://localhost:${config.port}`);
      console.log(`📋 Health: http://localhost:${config.port}/api/health`);
      console.log(`=========================================`);
    });
  } catch (err: any) {
    console.error("Failed to start Green Garden backend:", err);
    process.exit(1);
  }
}

bootstrap();
