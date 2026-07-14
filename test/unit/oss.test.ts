import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { getOriginalFileName, UploadFile } from "../../src/libs/oss";

describe("OSS 相关测试", () => {
  it("文件上传下载测试", async () => {
    // 初始化文件
    const file = new File(["Hello, OSS!"], "test.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);

    const updateRes = await UploadFile(file, env.R2_BUCKET);
    expect(updateRes).toHaveProperty("key");
    expect(updateRes).toHaveProperty("etag");
    expect(updateRes).toHaveProperty("size");
    expect(updateRes).toHaveProperty("contentType");
    expect(updateRes.contentType).toBe("text/plain");
    expect(updateRes.size).toBe(file.size);
    expect(updateRes.key).toMatch(new RegExp(`^.+-${file.name}$`));
    expect(updateRes.etag).toMatch(/^[a-f0-9]{32}$/);

    const key = updateRes.key;

    const downloadRes = await env.R2_BUCKET.get(key);
    expect(downloadRes).not.toBeNull();
    if (downloadRes) {
      const downloadedFile = await downloadRes.arrayBuffer();
      const downloadedText = new TextDecoder().decode(downloadedFile);
      expect(downloadedText).toBe("Hello, OSS!");
    }
  });

  it("优先使用 R2 元数据中的原始文件名", () => {
    expect(
      getOriginalFileName({
        key: "avatars/550e8400-e29b-41d4-a716-446655440000-invoice-2026.pdf",
        customMetadata: { originalName: "invoice-2026.pdf" }
      })
    ).toBe("invoice-2026.pdf");
  });

  it("缺少原始文件名元数据时只移除 UUID 前缀", () => {
    expect(
      getOriginalFileName({
        key: "avatars/550e8400-e29b-41d4-a716-446655440000-invoice-2026.pdf",
        customMetadata: {}
      })
    ).toBe("invoice-2026.pdf");
  });
});
