import { readFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export interface TemplateManifestEntry {
  source: string;
  destination: string;
  mode: number;
}

export interface TemplateManifest {
  schemaVersion: 1;
  files: TemplateManifestEntry[];
}

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

export const bundledTemplateDirectory = resolve(packageDirectory, "template");
export const bundledManifestPath = resolve(
  packageDirectory,
  "template-manifest.json"
);

export async function readTemplateManifest(
  manifestPath = bundledManifestPath
): Promise<TemplateManifest> {
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8")
  ) as TemplateManifest;

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) {
    throw new Error("脚手架模板清单格式无效，请重新安装 @ryanzeng/cfo-cli");
  }

  for (const entry of manifest.files) {
    assertSafeRelativePath(entry.source);
    assertSafeRelativePath(entry.destination);

    if (!Number.isInteger(entry.mode) || entry.mode < 0 || entry.mode > 0o777) {
      throw new Error(`模板文件权限无效：${entry.destination}`);
    }
  }

  return manifest;
}

export function resolveInside(
  baseDirectory: string,
  relativePath: string
): string {
  assertSafeRelativePath(relativePath);

  const resolvedBase = resolve(baseDirectory);
  const resolvedPath = resolve(resolvedBase, ...relativePath.split("/"));
  const basePrefix = resolvedBase.endsWith(sep)
    ? resolvedBase
    : `${resolvedBase}${sep}`;

  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(basePrefix)) {
    throw new Error(`模板路径越界：${relativePath}`);
  }

  return resolvedPath;
}

function assertSafeRelativePath(relativePath: string): void {
  if (
    !relativePath ||
    relativePath.startsWith("/") ||
    relativePath.includes("\\") ||
    relativePath.split("/").some((segment) => segment === ".." || !segment)
  ) {
    throw new Error(`模板路径无效：${relativePath}`);
  }
}
