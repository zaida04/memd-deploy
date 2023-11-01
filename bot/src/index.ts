import "dotenv/config";
import { Client } from "discord.js";
import { DEPLOY_SECRET, DEPLOY_URL } from "./env";
const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
const WHITELISTED_IDS = ["500765481788112916", "328723945266348033"];

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (message) => {
    if (message.content !== "!deploy") return;
    if (!WHITELISTED_IDS.includes(message.author.id)) {
        message.reply("You are not allowed to use this command.");
        return
    }

    const request = await fetch(DEPLOY_URL, {
        method: "POST",
        body: JSON.stringify({ secret: DEPLOY_SECRET })
    });

    if (request.ok) {
        message.reply("Deploying!");
    } else {
        message.reply("Something went wrong. " + await request.text());
        return;
    }

    setTimeout(async () => {
        const frontendTest = await fetch("https://tracing.cse.buffalo.edu/");
        if (frontendTest.ok) {
            message.reply("Frontend is up!");
        } else {
            message.reply("Frontend is down!");
        }

        const backendTest = await fetch("https://tracing.cse.buffalo.edu/api/");
        if (backendTest.ok) {
            message.reply("Backend is up!");
        } else {
            message.reply("Backend is down!");
        }
    }, 45_000);
});

client.login(process.env.DISCORD_TOKEN);