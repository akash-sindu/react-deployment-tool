import S3 from "aws-sdk/clients/s3.js";
import fs from "fs";
import env from "dotenv";

env.config();

const s3 = new S3({
  endpoint: `${process.env.BUCKET_URL}`,
  accessKeyId: `${process.env.BUCKET_ID}`,
  secretAccessKey: `${process.env.BUCKET_SECRET}`,
});
export const uploadFilesToR2 = async (r2FilePath, localFilePath) => {
  const localFile = fs.readFileSync(localFilePath);
  const uploadStatusToR2 = await s3
    .upload({
      Body: localFile,
      Bucket: process.env.BUCKET_NAME,
      Key: r2FilePath,
    })
    .promise();
  console.log(uploadStatusToR2);
};
