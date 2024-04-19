import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildProject(id) {
  return new Promise((resolve) => {
    const child = exec(
      `cd ${path.join(
        __dirname,
        `clonedRepo/${id}`
      )} && npm install && npm run build`
    );

    child.stdout.on("data", function (data) {
      console.log("stdout: " + data);
    });
    child.stderr.on("data", function (data) {
      console.log("stderr: " + data);
    });

    child.on("close", function (code) {
      resolve("");
    });
  });
}
