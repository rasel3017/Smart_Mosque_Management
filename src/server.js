import express from "express";
import "dotenv/config";
import { connectDB, disconnectDB } from "./config/db.js";

//Import Routes
import authRoutes from "./routes/auth.routes.js";
import mosqueRoutes from "./routes/mosque.routes.js";
import maktabRoutes from "./routes/maktab.routes.js";
import eventRoutes  from "./routes/event.routes.js";
import qaRoutes  from "./routes/qa.routes.js";

connectDB();
const app = express();



// Body parsing middlwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// API Routes
app.use("/api/auth",authRoutes);
app.use("/api/mosques",mosqueRoutes);
app.use("/api/maktabs", maktabRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/qa", qaRoutes );

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}); 