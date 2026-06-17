import { S3Client } from "@aws-sdk/client-s3";
import envConfig from "./env.config.js";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY,
    secretAccessKey: envConfig.AWS_SECRET_KEY,
  },
  region: envConfig.AWS_REGION,
});

export default s3Client;
