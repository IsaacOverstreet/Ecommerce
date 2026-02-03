import cloudinary from "@/lib/cloudinary/cloudinary";

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary cleanup success: ${publicId}`, result);
    return result;
  } catch (err) {
    console.error(`Cloudinary cleanup failed for ${publicId}:`, err);
  }
}
