import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.config.js";
import envConfig from "../config/env.config.js";

/**
 * Uploads a file to AWS S3.
 * @param {Object} file - Multer file object from memoryStorage
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<string>} Uploaded file public URL
 */
export const uploadToS3 = async (file, ownerId) => {
  try {
    // Clean filename to prevent S3 key encoding issues
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const key = `listings/${ownerId}/${Date.now()}-${cleanFileName}`;

    console.log("Uploading:", key);
    console.log("Bucket:", envConfig.AWS_BUCKET_NAME);

    const command = new PutObjectCommand({
      Bucket: envConfig.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Return the public URL of the uploaded image
    const url = `https://${envConfig.AWS_BUCKET_NAME}.s3.${envConfig.AWS_REGION}.amazonaws.com/${key}`;
    console.log("Uploaded Image URL:", url);
    return url;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
