import {
  chmod,
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  writeFile
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { TemplateManifest, TemplateManifestEntry } from "../src/template";

const cliDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryDirectory = resolve(cliDirectory, "../..");
const templateDirectory = resolve(cliDirectory, "template");
const manifestPath = resolve(cliDirectory, "template-manifest.json");
const projectNameToken = "__PROJECT_NAME__";

const allowedRootFiles = new Set([
  ".dev.vars.example",
  ".gitignore",
  ".oxfmtrc.json",
  ".oxlintrc.json",
  "README.md",
  "bun.lock",
  "drizzle.config.ts",
  "package.json",
  "tsconfig.json",
  "vitest.config.ts",
  "worker-configuration.d.ts"
]);

const allowedPrefixes = [
  ".husky/",
  ".vscode/",
  "docs/",
  "drizzle/",
  "examples/",
  "src/",
  "test/"
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".md",
  ".mdc",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

async function main(): Promise<void> {
  const trackedFiles = readTrackedFiles().filter(isAllowedTemplateFile);
  const sourceWrangler = await readFile(
    resolve(repositoryDirectory, "wrangler.jsonc"),
    "utf8"
  );
  const sourceApiOrigin = readApiOrigin(sourceWrangler);
  const manifestEntries: TemplateManifestEntry[] = [];

  await mkdir(templateDirectory, { recursive: true });

  for (const trackedFile of trackedFiles) {
    const sourcePath = resolve(repositoryDirectory, ...trackedFile.split("/"));
    const encodedPath = encodeTemplatePath(trackedFile);
    const outputPath = resolve(templateDirectory, ...encodedPath.split("/"));
    const sourceStat = await stat(sourcePath);

    await mkdir(dirname(outputPath), { recursive: true });

    let contents = await readFile(sourcePath);

    if (trackedFile === "package.json") {
      contents = Buffer.from(sanitizePackageJson(contents.toString("utf8")));
    } else if (isTextFile(trackedFile)) {
      let text = sanitizePublicText(contents.toString("utf8"), sourceApiOrigin);

      if (trackedFile === "vitest.config.ts") {
        text = createTestVitestConfig(text);
      }

      contents = Buffer.from(text);
    }

    await writeFile(outputPath, contents);
    await chmod(outputPath, sourceStat.mode & 0o777);

    manifestEntries.push({
      source: encodedPath,
      destination: trackedFile,
      mode: sourceStat.mode & 0o777
    });
  }

  await addWranglerOverride(manifestEntries);
  manifestEntries.sort((left, right) =>
    left.destination.localeCompare(right.destination)
  );

  await removeStaleGeneratedFiles(
    new Set(manifestEntries.map(({ source }) => source))
  );

  const manifest: TemplateManifest = {
    schemaVersion: 1,
    files: manifestEntries
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${manifestEntries.length} template files.`);
}

function readTrackedFiles(): string[] {
  const result = spawnSync("git", ["ls-files", "-z"], {
    cwd: repositoryDirectory,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "无法读取 Git 文件清单");
  }

  return result.stdout.split("\0").filter(Boolean);
}

function isAllowedTemplateFile(path: string): boolean {
  return (
    allowedRootFiles.has(path) ||
    allowedPrefixes.some((prefix) => path.startsWith(prefix))
  );
}

function encodeTemplatePath(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      if (segment === ".gitignore") {
        return "__dot__gitignore";
      }

      if (segment === "bunfig.toml") {
        return "__template__bunfig.toml";
      }

      return segment;
    })
    .join("/");
}

function sanitizePackageJson(contents: string): string {
  const packageJson = JSON.parse(contents) as {
    name?: string;
    scripts?: Record<string, string>;
  };

  packageJson.name = projectNameToken;

  if (packageJson.scripts) {
    delete packageJson.scripts.install;

    for (const [name, command] of Object.entries(packageJson.scripts)) {
      packageJson.scripts[name] = command.replaceAll(
        "cloudflare-hono-api-starter",
        projectNameToken
      );
    }
  }

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function sanitizePublicText(contents: string, sourceApiOrigin: string): string {
  const withoutPrivateOrigin = contents.replaceAll(
    sourceApiOrigin,
    "http://localhost:8787"
  );

  return withoutPrivateOrigin
    .replace(
      'const apiOrigin =\n  "http://localhost:8787";',
      'const apiOrigin = "http://localhost:8787";'
    )
    .replace(
      '"title": "cloudflare-hono-api-starter"',
      `"title": "${projectNameToken}"`
    );
}

function createTestVitestConfig(contents: string): string {
  const productionConfigPath = 'configPath: "./wrangler.jsonc"';
  const registerBinding = 'REGISTER_OPEN: "true"';

  if (
    !contents.includes(productionConfigPath) ||
    !contents.includes(registerBinding)
  ) {
    throw new Error(
      "vitest.config.ts 未包含预期的 Wrangler 或测试 Binding 配置"
    );
  }

  return contents
    .replace(productionConfigPath, 'configPath: "./wrangler.test.jsonc"')
    .replace(
      registerBinding,
      `REGISTER_OPEN: "true",
          JWT_SECRET: "test-jwt-secret",
          GITHUB_CLIENT_ID: "test-github-client-id",
          GITHUB_CLIENT_SECRET: "test-github-client-secret"`
    );
}

function readApiOrigin(wranglerConfig: string): string {
  const match = wranglerConfig.match(/"API_ORIGIN"\s*:\s*"([^"]+)"/);

  if (!match?.[1]) {
    throw new Error("无法从 wrangler.jsonc 读取 API_ORIGIN");
  }

  return match[1];
}

function isTextFile(path: string): boolean {
  if (path.endsWith(".d.ts")) {
    return true;
  }

  const extensionIndex = path.lastIndexOf(".");
  return (
    extensionIndex >= 0 &&
    textExtensions.has(path.slice(extensionIndex).toLowerCase())
  );
}

async function addWranglerOverride(
  manifestEntries: TemplateManifestEntry[]
): Promise<void> {
  const sourcePath = resolve(cliDirectory, "template-overrides/wrangler.jsonc");
  const sourceStat = await stat(sourcePath);
  const productionConfig = await readFile(sourcePath, "utf8");
  const aiBinding = `  "ai": {
    "binding": "AI",
    "remote": true
  },
`;
  const requiredSecrets = `  "secrets": {
    "required": ["JWT_SECRET", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"]
  },
`;

  if (
    !productionConfig.includes(aiBinding) ||
    !productionConfig.includes(requiredSecrets)
  ) {
    throw new Error("Wrangler 模板中缺少预期的远程 AI 或 Secret 配置");
  }

  await writeWranglerConfig(
    "wrangler.jsonc",
    productionConfig,
    sourceStat.mode,
    manifestEntries
  );
  await writeWranglerConfig(
    "wrangler.test.jsonc",
    productionConfig.replace(aiBinding, "").replace(requiredSecrets, ""),
    sourceStat.mode,
    manifestEntries
  );
}

async function writeWranglerConfig(
  destination: string,
  contents: string,
  mode: number,
  manifestEntries: TemplateManifestEntry[]
): Promise<void> {
  const outputPath = resolve(templateDirectory, destination);

  await writeFile(outputPath, contents);
  await chmod(outputPath, mode & 0o777);
  manifestEntries.push({
    source: destination,
    destination,
    mode: mode & 0o777
  });
}

async function removeStaleGeneratedFiles(
  expectedFiles: ReadonlySet<string>,
  directory = templateDirectory
): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await removeStaleGeneratedFiles(expectedFiles, path);
      continue;
    }

    const generatedPath = relative(templateDirectory, path)
      .split("\\")
      .join("/");

    if (!expectedFiles.has(generatedPath)) {
      await unlink(path);
    }
  }
}

await main();
