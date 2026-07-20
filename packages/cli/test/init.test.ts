import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { initProject } from "../src/init";
import { bundledManifestPath, bundledTemplateDirectory } from "../src/template";

beforeAll(() => {
  const build = spawnSync("bun", ["run", "build:template"], {
    cwd: resolve(import.meta.dirname, ".."),
    stdio: "inherit"
  });

  expect(build.status).toBe(0);
});

describe("initProject", () => {
  it("creates a sanitized project and replaces project tokens", async () => {
    const parent = await createTemporaryDirectory();
    const target = resolve(parent, "sample-api");

    const result = await initProject({
      targetDirectory: target,
      installDependencies: false
    });

    expect(result.projectName).toBe("sample-api");

    const packageJson = JSON.parse(
      await readFile(resolve(target, "package.json"), "utf8")
    ) as { name: string; private: boolean; scripts: Record<string, string> };
    const wrangler = await readFile(resolve(target, "wrangler.jsonc"), "utf8");
    const testWrangler = await readFile(
      resolve(target, "wrangler.test.jsonc"),
      "utf8"
    );
    const vitestConfig = await readFile(
      resolve(target, "vitest.config.ts"),
      "utf8"
    );
    const gitignore = await readFile(resolve(target, ".gitignore"), "utf8");
    const bunfig = await readFile(
      resolve(target, "examples/agent-react-example/bunfig.toml"),
      "utf8"
    );

    expect(packageJson.name).toBe("sample-api");
    expect(packageJson.private).toBe(true);
    expect(packageJson.scripts.install).toBeUndefined();
    expect(packageJson.scripts["db:deploy"]).toContain("sample-api");
    expect(wrangler).toContain('"name": "sample-api"');
    expect(wrangler).not.toContain("database_id");
    expect(wrangler).not.toContain("bucket_name");
    expect(wrangler).not.toContain("rubyceng0326");
    expect(testWrangler).toContain('"name": "sample-api"');
    expect(testWrangler).not.toContain('"binding": "AI"');
    expect(testWrangler).not.toContain('"secrets"');
    expect(vitestConfig).toContain('configPath: "./wrangler.test.jsonc"');
    expect(vitestConfig).toContain('JWT_SECRET: "test-jwt-secret"');
    expect(gitignore).toContain("node_modules/");
    expect(bunfig).toContain("[serve.static]");
  });

  it("allows initialization in a directory containing only .git", async () => {
    const parent = await createTemporaryDirectory();
    const target = resolve(parent, "existing-repository");

    await mkdir(resolve(target, ".git"), { recursive: true });

    await expect(
      initProject({
        targetDirectory: target,
        installDependencies: false
      })
    ).resolves.toMatchObject({ projectName: "existing-repository" });
  });

  it("rejects a non-empty target directory", async () => {
    const parent = await createTemporaryDirectory();
    const target = resolve(parent, "occupied-api");

    await mkdir(target, { recursive: true });
    await writeFile(resolve(target, "existing.txt"), "keep me");

    await expect(
      initProject({
        targetDirectory: target,
        installDependencies: false
      })
    ).rejects.toThrow("目标目录不是空目录");

    expect(await readFile(resolve(target, "existing.txt"), "utf8")).toBe(
      "keep me"
    );
  });

  it("rejects project names that are invalid for Worker deployment", async () => {
    const parent = await createTemporaryDirectory();

    await expect(
      initProject({
        targetDirectory: resolve(parent, "Invalid Project"),
        installDependencies: false
      })
    ).rejects.toThrow("项目名");
  });

  it("uses the bundled manifest and template", async () => {
    expect(basename(bundledManifestPath)).toBe("template-manifest.json");
    expect(basename(bundledTemplateDirectory)).toBe("template");
    expect(
      JSON.parse(await readFile(bundledManifestPath, "utf8"))
    ).toMatchObject({ schemaVersion: 1 });
  });
});

async function createTemporaryDirectory(): Promise<string> {
  return mkdtemp(resolve(tmpdir(), "cfo-cli-"));
}
