import { exec } from "pkg";
import execa from "execa";
import fs from "node:fs";

//
(async () => {
  let extension = "";
  if (process.platform === "win32") {
    extension = ".exe";
  }

  const rustInfo = (await execa("rustc", ["-vV"])).stdout;
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];

  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
  }

  for (const target of [
    "node18-macos-arm64",
    //   "node18-macos-x64",
    //   "node18-linux-arm64",
    //   "node18-linux-x64",
    //   "node18-win-arm64",
    //   "node18-win-x64",
  ]) {
    try {
      await exec([
        "src-chat/server.js",
        "--target",
        target,
        "--output",
        `src-tauri/bin/MultiChat-${targetTriple}${extension}`,
      ]);
    } catch (error) {
      console.error(error);
    }
  }
})();
