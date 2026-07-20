import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, dirname, resolve } from "node:path";
import {
  bundledManifestPath,
  bundledTemplateDirectory,
  readTemplateManifest,
  resolveInside
} from "./template";

const projectNamePattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const allowedExistingEntries = new Set([".git", ".DS_Store"]);

export interface InitProjectOptions {
  targetDirectory: string;
  installDependencies?: boolean;
  templateDirectory?: string;
  manifestPath?: string;
}

export interface InitProjectResult {
  projectName: string;
  targetDirectory: string;
}

export async function initProject({
  targetDirectory,
  installDependencies = true,
  templateDirectory = bundledTemplateDirectory,
  manifestPath = bundledManifestPath
}: InitProjectOptions): Promise<InitProjectResult> {
  const target = resolve(targetDirectory);
  const projectName = basename(target);

  assertValidProjectName(projectName);

  await mkdir(target, { recursive: true });
  await assertTargetIsAvailable(target);

  const manifest = await readTemplateManifest(manifestPath);

  for (const entry of manifest.files) {
    const source = resolveInside(templateDirectory, entry.source);
    const destination = resolveInside(target, entry.destination);

    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
    await chmod(destination, entry.mode);
  }

  await replaceProjectTokens(target, projectName, manifest.files);

  if (installDependencies) {
    await runBunInstall(target);
  }

  return { projectName, targetDirectory: target };
}

export function assertValidProjectName(projectName: string): void {
  if (!projectNamePattern.test(projectName)) {
    throw new Error(
      `项目名“${projectName}”无效；请使用 1-63 位小写字母、数字和连字符，且不能以连字符开头或结尾`
    );
  }
}

async function assertTargetIsAvailable(targetDirectory: string): Promise<void> {
  const entries = await readdir(targetDirectory);
  const conflicts = entries.filter(
    (entry) => !allowedExistingEntries.has(entry)
  );

  if (conflicts.length > 0) {
    throw new Error(
      `目标目录不是空目录：${targetDirectory}\n冲突内容：${conflicts.join(", ")}`
    );
  }
}

async function replaceProjectTokens(
  targetDirectory: string,
  projectName: string,
  files: Array<{ destination: string }>
): Promise<void> {
  const tokenizedFiles = files.filter(({ destination }) =>
    [
      "package.json",
      "wrangler.jsonc",
      "wrangler.test.jsonc",
      "docs/openapi.json"
    ].includes(destination)
  );

  for (const { destination } of tokenizedFiles) {
    const path = resolveInside(targetDirectory, destination);
    const contents = await readFile(path, "utf8");
    await writeFile(path, contents.replaceAll("__PROJECT_NAME__", projectName));
  }
}

async function runBunInstall(targetDirectory: string): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn("bun", ["install"], {
      cwd: targetDirectory,
      stdio: "inherit"
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      const reason = signal ? `信号 ${signal}` : `退出码 ${code ?? "未知"}`;
      reject(new Error(`依赖安装失败（${reason}）`));
    });
  });
}
