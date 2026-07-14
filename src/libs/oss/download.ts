export const DownloadFile = async (key: string, bucket: R2Bucket) => {
  const object = await bucket.get(key);

  if (!object) {
    return null;
  }

  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";

  const originalName =
    object.customMetadata?.originalName || key.split("/").at(-1) || "download";

  const result = {
    originalName,
    stream: object.body,
    contentType,
    etag: object.httpEtag,
    size: object.size,
    httpMetadata: object.httpMetadata
  };

  function writeHttpMetadata(headers: Headers) {
    if (result.httpMetadata) {
      for (const [key, value] of Object.entries(result.httpMetadata)) {
        headers.set(key, value);
      }
    }
  }

  return {
    ...result,
    writeHttpMetadata
  };
};
