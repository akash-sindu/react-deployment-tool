import { createClient } from "redis";
import {
  deployBuildFilesToR2,
  retrieveDatafromR2,
} from "./retriveFilesFromR2.js";
import { buildProject } from "./build.js";
const client = createClient();
client.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const idFromRedis = await client.brPop("build-queue", 0);

    await retrieveDatafromR2(`clonedRepo/${idFromRedis.element}`);
    console.log("starting build............");
    await buildProject(idFromRedis.element);
    await deployBuildFilesToR2(idFromRedis.element);
    publisher.hSet("status", idFromRedis.element, "deployed");
  }
}

main();
