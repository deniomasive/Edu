import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// In production, restrict to the configured frontend URL and any *.onrender.com
// sub-domain so Render preview URLs work out of the box.
// In development, allow all origins for convenience.
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }
      // Server-to-server or same-origin requests have no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowedExact: (string | undefined)[] = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:20631",
        "http://localhost:3000",
      ];
      if (
        allowedExact.includes(origin) ||
        origin.endsWith(".onrender.com")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
  }),
);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", router);

export default app;
