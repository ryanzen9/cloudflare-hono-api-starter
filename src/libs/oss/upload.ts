export const UploadFile = async (
  file: File,
  bucket: R2Bucket,
  dir?: string
) => {
  const key = dir
    ? `${dir}/${crypto.randomUUID()}-${file.name}`
    : `${crypto.randomUUID()}-${file.name}`;

  const object = await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream"
    },
    customMetadata: {
      originalName: file.name
    }
  });

  return {
    key,
    etag: object.etag,
    size: file.size,
    contentType: file.type
  };
};
