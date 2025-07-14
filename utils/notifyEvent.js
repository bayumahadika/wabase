import moment from "moment-timezone";
moment.locale("id");
import chalk from "chalk";

export default function notifyEvent(ev, body, type) {
  var bgColor =
    type !== "error" ? chalk.white.bold.bgBlueBright : chalk.white.bold.bgRed;
  var time = moment.tz("Asia/Jakarta").format("dddd, DD MMMM YYYY - HH:mm:ss");
  console.log(`
${bgColor(` ${global.bot.name} `)} | ${time}
${bgColor(` ${ev} `)}
${typeof body !== "string" ? JSON.stringify(body) : String(body)}
`);
}

