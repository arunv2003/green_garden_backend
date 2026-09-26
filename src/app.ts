import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Import Society Management routers
import authRouter from "./modules/auth/routes.js";
import societyRouter from "./modules/society/routes.js";
import flatsRouter from "./modules/flats/routes.js";
import residentsRouter from "./modules/residents/routes.js";
import maintenanceRouter from "./modules/maintenance/routes.js";
import paymentsRouter from "./modules/payments/routes.js";
import ledgerRouter from "./modules/ledger/routes.js";
import visitorsRouter from "./modules/visitors/routes.js";
import complaintsRouter from "./modules/complaints/routes.js";
import announcementsRouter from "./modules/announcements/routes.js";
import expensesRouter from "./modules/expenses/routes.js";
import reportsRouter from "./modules/reports/routes.js";
import dashboardRouter from "./modules/dashboard/routes.js";
import staffRouter from "./modules/staff/routes.js";

// Legacy module routers for backwards compatibility
import roomsRouter from "./modules/rooms/routes.js";
import guestsRouter from "./modules/guests/routes.js";
import staysRouter from "./modules/stays/routes.js";
import billsRouter from "./modules/bills/routes.js";

const app = express();

// Security and utility middlewares
app.use(helmet());
const rawOrigins = (config.frontendUrl || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://green-garden.arunverma.online",
];

const allowedOrigins = Array.from(new Set([...rawOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, mobile apps, curl)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app") ||
        cleanOrigin.includes("arunverma.online");

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/auth", authRouter);
app.use("/api/society", societyRouter);
app.use("/api/flats", flatsRouter);
app.use("/api/residents", residentsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/ledger", ledgerRouter);
app.use("/api/visitors", visitorsRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/staff", staffRouter);



// Legacy routes preserved during migration
app.use("/api/rooms", roomsRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/stays", staysRouter);
app.use("/api/bills", billsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
