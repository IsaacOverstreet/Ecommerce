import cloudinary from "@/lib/cloudinary/cloudinary";

type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadFileToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Image exceeds ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`);
  }

  // Convert to base64
  const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

  // Upload directly using await
  const result = await cloudinary.uploader.upload(base64, {
    folder: "products",
    resource_type: "image",
    quality: "auto", // compress for best balance of size and quality
    fetch_format: "auto", // serve modern formats like WebP/AVIF if possible
    transformation: [
      { width: 2000, crop: "limit" }, // optional: limit max dimensions
    ],
  });

  return { public_id: result.public_id, secure_url: result.secure_url };
}
