import { exec } from "pkg";
import execa from "execa";
import fs from "node:fs";

//
(async () => {
  const arch = process.arch;
  const platform = process.platform === 'darwin' ?
    "macos" :
    process.platform === 'linux' ?
    "linux" :
    process.platform === 'win32' ?
    "win" :
    null;
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
    `node18-${platform}-${arch}`,
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
