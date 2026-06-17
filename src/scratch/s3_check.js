import dotenv from "dotenv";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

dotenv.config();

console.log("=== AWS Credentials Check ===");
console.log("AWS_ACCESS_KEY:", process.env.AWS_ACCESS_KEY ? "FOUND" : "MISSING");
console.log("AWS_SECRET_KEY:", process.env.AWS_SECRET_KEY ? "FOUND" : "MISSING");
console.log("AWS_REGION:", process.env.AWS_REGION || "NOT SET (defaults to ap-south-1)");
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME || "NOT SET");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_REGION || "ap-south-1",
});

async function checkS3() {
  try {
    console.log("\nAttempting to connect to AWS S3...");
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      MaxKeys: 1,
    });
    const response = await s3Client.send(command);
    console.log("AWS S3 Connection: SUCCESS!");
    console.log("Bucket Access: SUCCESS!");
    console.log("Sample Response metadata:", response.$metadata);
  } catch (error) {
    console.error("AWS S3 Connection: FAILED!");
    console.error("Error Detail:", error);
  }
}

checkS3();
