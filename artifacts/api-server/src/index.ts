import app from "./app";
import { logger } from "./lib/logger";

const PORT = Number(process.env["PORT"] || 10000);

if (Number.isNaN(PORT) || PORT <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

app.listen(PORT, "0.0.0.0", () => {
  logger.info({ port: PORT }, "Server listening");
});
