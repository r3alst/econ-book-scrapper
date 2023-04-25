import fs = require("fs");
import { BotConfig } from "../types";

const BOT_CACHE_FILE = "bot.json";

export const loadBotCache = (): BotConfig => {
  if(!fs.existsSync(BOT_CACHE_FILE)) {
    fs.writeFileSync("bot.json", JSON.stringify({
      chapters: []
    }));
  }
  return JSON.parse(fs.readFileSync(BOT_CACHE_FILE).toString());
}

export const writeBotCache = (config: BotConfig) => {
  fs.writeFileSync("bot.json", JSON.stringify(config, null, 2));
}