const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5mb per image

export function checkBase64Size(base64: string) {
  // Rough size calculation
  const size = Math.ceil((base64.length * 3) / 4);
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image too large. Max size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`
    );
  }
}
