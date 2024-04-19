import fs from "fs";
import path from "path";

export default function getAllFilePaths(folderPath) {
  let response = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFilePaths(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
}
