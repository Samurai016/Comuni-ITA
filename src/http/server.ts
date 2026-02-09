import Fastify from "fastify";
import compress from "@fastify/compress";
import etag from "@fastify/etag";
import cors from "@fastify/cors";
import { loadAndIndexData } from "../data/indexes";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

import { regioniRoutes } from "./routes/regioni";
import { provinceRoutes } from "./routes/province";
import { comuniRoutes } from "./routes/comuni";
import { responseFormatter } from "./plugins/response-formatter";

// Register plugins
fastify.register(cors);
fastify.register(compress);
fastify.register(etag);
fastify.register(responseFormatter);

fastify.register(regioniRoutes);
fastify.register(provinceRoutes);
fastify.register(comuniRoutes);

// Root route for health check or basic info
fastify.get("/", async (request, reply) => {
  return { message: "Comuni-ITA API is running!", datasetVersion: process.env.DATASET_VERSION || "N/A" };
});

const start = async () => {
  try {
    loadAndIndexData(); // Load and index data at startup

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  await fastify.close();
  console.log("Server gracefully shut down.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await fastify.close();
  console.log("Server gracefully shut down.");
  process.exit(0);
});

start();
