#!/usr/bin/env bun

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initProject } from "./init";

const help = `cfo-cli

用法：
  cfo-cli init [目录] [--no-install]
  cfo-cli --help
  cfo-cli --version

示例：
  bunx @ryanzeng/cfo-cli init my-api
  bunx @ryanzeng/cfo-cli init
  bunx @ryanzeng/cfo-cli init my-api --no-install`;

async function main(args: string[]): Promise<void> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(help);
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(await readVersion());
    return;
  }

  const [command, ...commandArgs] = args;

  if (command !== "init") {
    throw new Error(`未知命令：${command ?? "(空)"}\n\n${help}`);
  }

  const unknownFlags = commandArgs.filter(
    (argument) => argument.startsWith("-") && argument !== "--no-install"
  );

  if (unknownFlags.length > 0) {
    throw new Error(`未知选项：${unknownFlags.join(", ")}`);
  }

  const directories = commandArgs.filter(
    (argument) => !argument.startsWith("-")
  );

  if (directories.length > 1) {
    throw new Error("只能指定一个目标目录");
  }

  const result = await initProject({
    targetDirectory: directories[0] ?? ".",
    installDependencies: !commandArgs.includes("--no-install")
  });

  const relativeTarget = resolve(result.targetDirectory);
  console.log(`\n✓ 已创建 ${result.projectName}`);
  console.log(`  目录：${relativeTarget}`);

  if (relativeTarget !== resolve(".")) {
    console.log(`\n下一步：\n  cd ${directories[0]}`);
  } else {
    console.log("\n下一步：");
  }

  if (commandArgs.includes("--no-install")) {
    console.log("  bun install");
  }

  console.log("  cp .dev.vars.example .dev.vars");
  console.log("  bun run db:deploy");
  console.log("  bun run start");
}

async function readVersion(): Promise<string> {
  const sourceDirectory = dirname(fileURLToPath(import.meta.url));
  const packageJson = JSON.parse(
    await readFile(resolve(sourceDirectory, "../package.json"), "utf8")
  ) as { version?: string };

  if (!packageJson.version) {
    throw new Error("无法读取 CLI 版本");
  }

  return packageJson.version;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n✗ ${message}`);
  process.exitCode = 1;
});
