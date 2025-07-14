import fs from "fs";
import path from "path";
import axios from "axios";

var repoDATAWANumber = "";
var rawDATAWANumber = repoDATAWANumber
  .replace("https://github", "https://raw.githubusercontent")
  .replace("/blob/", "/");

const pkg = JSON.parse(fs.readFileSync("package.json"));

global.bot = {
  name: "Bayu Mahadika",
  number: "",
  numbers: repoDATAWANumber ? (await axios.get(rawDATAWANumber)).data : null,
  version: pkg["version"],
  prefix: ".",
  splitArgs: "|",
  locale: "id",
  timezone: "Asia/Jakarta",
  adsUrl: "https://youtube.com/@bayumahadika",
  newsletterJid: "",
  commands: await (async () => {
    const commands = [];
    const commandsPath = path.join(process.cwd(), "commands");
    const files = fs
      .readdirSync(commandsPath, { recursive: true })
      .filter((file) => file.endsWith(".js"));
    for await (let file of files) {
      const filePath = path.join(commandsPath, file);
      const fileCont = await import(filePath);
      const command = path.basename(filePath).replace(".js", "").toLowerCase();
      const isExistCommand = commands.find((cmd) => cmd.command === command);
      if (isExistCommand) {
        console.log(
          `Terdapat filename duplikat, filename sebagai command\nFile path: \n${filePath}\n ${isExistCommand.filePath}`,
        );
        process.exit();
      }
      commands.push({
        ...fileCont,
        filePath,
        command,
      });
    }
    return commands;
  })(),
  setting: JSON.parse(fs.readFileSync("./config/setting.json")),
  saveSetting: function () {
    fs.writeFileSync(
      "./config/setting.json",
      JSON.stringify(global.bot.setting),
    );
    return global.bot.setting;
  },
};

global.owner = {
  name: "Bayu Mahadika",
  number: "",
};

global.db = {
  user: JSON.parse(fs.readFileSync("./database/user.json")),
  premium: JSON.parse(fs.readFileSync("./database/premium.json")),
  group: JSON.parse(fs.readFileSync("./database/group.json")),
  save: async function (dbName) {
    fs.writeFileSync(
      `./database/${dbName.toLowerCase()}.json`,
      JSON.stringify(global.db[dbName.toLowerCase()]),
    );
    return global.db[dbName.toLowerCase()];
  },
};
