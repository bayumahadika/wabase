import fs from "fs";
import path from "path";
import obfus from "javascript-obfuscator";

(async function obfuscate(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  for await (let file of fs.readdirSync(source)) {
    const dirpath = path.join(source, file);
    const outpath = path.join(target, file);

    if (fs.statSync(dirpath).isDirectory()) {
      if (
        [".git", "encrypted", "node_modules", "session", "sessions"].includes(
          file,
        )
      )
        continue;
      await obfuscate(dirpath, outpath);
    } else {
      console.log(
        `\x1b[1;44m\x20${dirpath}\x1b[0m\n\x1b[1;34m=>\x1b[0m\x20${outpath}`,
      );

      if (!fs.existsSync(path.dirname(outpath))) {
        fs.mkdirSync(path.dirname(outpath), { recursive: true });
      }

      fs.copyFileSync(dirpath, outpath);

      if (path.extname(dirpath) === ".js") {
        const filecont = fs.readFileSync(dirpath, "utf8");
        const obfuscated = obfus
          .obfuscate(filecont, {
            compact: true,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            stringArrayThreshold: 1,
            renameGlobals: true,
            identifierNamesGenerator: "dictionary",
            identifiersDictionary: [
              "nexenc",
              "kyogan",
              "harvest",
              "flux",
              "aura",
              "theark",
              "harness",
              "bayumahadika",
            ],
            identifiersPrefix: "ﾀ",
            selfDefending: true,
            splitStrings: true,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ["base64"],
            target: "browser-no-eval",
            simplify: false,
          })
          .getObfuscatedCode();

        fs.writeFileSync(outpath, obfuscated);
      }
    }
  }
})(process.cwd(), path.join(process.cwd(), "encrypted"));
