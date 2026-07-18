import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/env.config";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

class CloudinaryClient {
  uploadBuffer(
    buffer: Buffer,
    folder: string,
    resourceType: "image" | "video" = "image",
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result)
            return reject(error ?? new Error("Cloudinary upload failed"));
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }
}

export default new CloudinaryClient();
