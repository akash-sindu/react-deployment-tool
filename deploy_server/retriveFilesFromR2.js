import S3 from "aws-sdk/clients/s3.js";
import fs from "fs";
import path from "path";
import env from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const s3 = new S3({
  endpoint: `${process.env.BUCKET_URL}`,
  accessKeyId: `${process.env.BUCKET_ID}`,
  secretAccessKey: `${process.env.BUCKET_SECRET}`,
});

export async function retrieveDatafromR2(prefix) {
  const files = await s3
    .listObjectsV2({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix,
    })
    .promise();

  const allPromises =
    files.Contents.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }

        const finalPath = path.join(__dirname, Key);

        const outputFile = fs.createWriteStream(finalPath);
        const dirName = path.dirname(finalPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: process.env.BUCKET_NAME,
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];
  console.log("downloading..., please wait.");

  await Promise.all(allPromises?.filter((x) => x !== undefined)).then((val) =>
    console.log("-------------------------finished------------------------")
  );
}

export function deployBuildFilesToR2(id) {
  const folderPath = path.join(__dirname, `clonedRepo/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
}

const getAllFiles = (folderPath) => {
  let response = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

const uploadFile = async (fileName, localFilePath) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
    })
    .promise();
  console.log(response);
};
