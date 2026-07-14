import { beforeAll, describe, expect, it } from "vitest";
import { genInitUser, login, registerUser, request } from "../../request";

describe("Oss API", async () => {
  let headers: Record<string, string> = {};

  beforeAll(async () => {
    const user = genInitUser();

    const registerResponse = await registerUser(user);
    expect(registerResponse.status).toBe(201);

    const loginResponse = await login(user);
    expect(loginResponse.status).toBe(201);

    const loginData: any = await loginResponse.json();
    expect(loginData.success).toBe(true);

    headers = {
      Authorization: `Bearer ${loginData.data.token}`
    };
  });

  it("should upload a file and download file", async () => {
    const fileContent = "Hello, World!";
    const file = new File([fileContent], "hello.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);

    const response = await request("/api/upload", {
      method: "POST",
      body: formData,
      headers
    });

    expect(response.status).toBe(201);

    const data: any = await response.json();
    const key = data.data.key;

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(key).toBeDefined();

    expect(data.data).toHaveProperty("etag");
    expect(data.data).toHaveProperty("size");
    expect(data.data).toHaveProperty("contentType");

    // Download the uploaded file
    const downloadResponse = await request(
      `/api/download/${encodeURIComponent(key)}`,
      {
        method: "GET",
        headers
      }
    );

    expect(downloadResponse.status).toBe(200);
    const downloadedContent = await downloadResponse.text();
    expect(downloadedContent).toBe(fileContent);
  });

  it("should return 400 if no file is provided", async () => {
    const formData = new FormData();

    const response = await request("/api/upload", {
      method: "POST",
      body: formData,
      headers
    });

    expect(response.status).toBe(400);
    const data: any = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.message).toBe("Missing file");
  });

  it("should return 404 if the file does not exist", async () => {
    const response = await request("/api/download/nonexistentfile", {
      method: "GET",
      headers
    });

    expect(response.status).toBe(404);
    const data: any = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.message).toBe("File not found");
  });

  it("should upload a file by Directory and download file", async () => {
    const fileContent = "Hello, World!";
    const file = new File([fileContent], "hello.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "testDir");

    const response = await request("/api/upload", {
      method: "POST",
      body: formData,
      headers
    });

    expect(response.status).toBe(201);

    const data: any = await response.json();
    const key = data.data.key;

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(key).toBeDefined();

    expect(data.data).toHaveProperty("etag");
    expect(data.data).toHaveProperty("size");
    expect(data.data).toHaveProperty("contentType");

    // Download the uploaded file
    const downloadResponse = await request(
      `/api/download/${encodeURIComponent(key)}`,
      {
        method: "GET",
        headers
      }
    );

    expect(downloadResponse.status).toBe(200);
    const downloadedContent = await downloadResponse.text();
    expect(downloadedContent).toBe(fileContent);
  });
});
