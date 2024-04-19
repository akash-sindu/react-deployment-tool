import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import genrateRandomId from "./src/utils.js";
import getAllFilePaths from "./src/files.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { uploadFilesToR2 } from "./src/uploadFilestoR2.js";
import { createClient } from "redis";
const redisClient = createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

const subscriber = createClient();
subscriber.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
const git = simpleGit();

app.post("/deploy", async (req, res) => {
  const url = req.body.data;
  const id = genrateRandomId(10);
  await git.clone(url, path.join(__dirname, `clonedRepo/${id}`));
  const files = getAllFilePaths(path.join(__dirname, `clonedRepo/${id}`));
  files.map(async (file) => {
    const r2FilePath = file.replace(`${__dirname}/`, "");

    await uploadFilesToR2(r2FilePath, file);
  });

  redisClient.lPush("build-queue", id);
  redisClient.hSet("status", id, "uploaded");

  res.json({
    id: id,
  });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id);
  res.json({
    status: response,
  });
});
app.listen(process.env.PORT);
