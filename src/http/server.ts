import Fastify from "fastify";
import compress from "@fastify/compress";
import etag from "@fastify/etag";
import cors from "@fastify/cors";
import { loadAndIndexData } from "../data/indexes";
import { ApiVersion } from "../domain/types";

/** Base url used to point deprecated routes at their versioned twin. */
const API_BASE_URL = process.env.API_BASE_URL || "https://comuni-ita.nicolorebaioli.dev";

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
import { comuniCessatiRoutes } from "./routes/comuni-cessati";
import { responseFormatter } from "./plugins/response-formatter";

// Register plugins
fastify.register(cors);
fastify.register(compress);
fastify.register(etag);
fastify.register(responseFormatter);

/**
 * Registers every route of a version on its own prefix.
 *
 * `regioni` and `province` are the same in both versions; the comuni change in
 * the shape of `cap`, and the comuni cessati are served by v5 alone.
 * @param version The version to serve.
 * @param prefix The prefix to serve it on.
 */
function registerVersion(version: ApiVersion, prefix: string) {
  fastify.register(
    async (instance) => {
      instance.register(regioniRoutes);
      instance.register(provinceRoutes);
      instance.register(comuniRoutes, { version });
      // I comuni cessati sono una novità della v5: la v4 resta quella di sempre.
      if (version === "v5") {
        instance.register(comuniCessatiRoutes);
      }
    },
    { prefix },
  );
}

// The unprefixed routes stay the ones they have always been, that is v4: the
// clients written before versioning go on working untouched.
fastify.register(async (instance) => {
  instance.addHook("onSend", async (request, reply) => {
    reply.header("Deprecation", "true");
    reply.header("Link", `<${API_BASE_URL}/v4${request.url}>; rel="successor-version"`);
  });
  instance.register(regioniRoutes);
  instance.register(provinceRoutes);
  instance.register(comuniRoutes, { version: "v4" });
});

registerVersion("v4", "/v4");
registerVersion("v5", "/v5");

// Root route for health check or basic info
fastify.get("/", async (request, reply) => {
  return {
    message: "Comuni-ITA API is running!",
    datasetVersion: process.env.DATASET_VERSION || "N/A",
    versions: ["v4", "v5"],
    latestVersion: "v5",
  };
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
