const UUID_PREFIX_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;

export const getOriginalFileName = (
  object: Pick<R2Object, "key" | "customMetadata">
) => {
  if (object.customMetadata?.originalName) {
    return object.customMetadata.originalName;
  }

  const keyFileName = object.key.split("/").at(-1) ?? "";

  return keyFileName.replace(UUID_PREFIX_PATTERN, "");
};

export const getFilePath = (object: Pick<R2Object, "key">) => {
  return object.key;
};

export const getFileSize = (object: Pick<R2Object, "size">) => {
  return object.size;
};

export const getFileHash = (object: Pick<R2Object, "etag">) => {
  return object.etag;
};
