import dotenv from "dotenv";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

dotenv.config();

const client = new S3Client({
  region: process.env.AWS_REGION?.trim() || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY?.trim(),
    secretAccessKey: process.env.AWS_SECRET_KEY?.trim(),
  }
});

const command = new PutBucketCorsCommand({
  Bucket: process.env.AWS_BUCKET_NAME?.trim(),
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
        AllowedOrigins: ["*"],
        ExposeHeaders: []
      }
    ]
  }
});

client.send(command)
  .then(() => console.log("CORS policy successfully set for bucket:", process.env.AWS_BUCKET_NAME?.trim()))
  .catch((err) => console.error("Error setting CORS policy:", err));
