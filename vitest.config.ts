import {
  cloudflareTest,
  readD1Migrations
} from "@cloudflare/vitest-pool-workers";
import agents from "agents/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const migrationsPath = fileURLToPath(new URL("./drizzle", import.meta.url));

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(migrationsPath),
          REGISTER_OPEN: true
        }
      }
    })),
    agents()
  ],
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"]
  }
});
