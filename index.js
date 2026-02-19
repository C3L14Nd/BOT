require("dotenv").config();

const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

// crée le client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

const CATEGORY_ID = "1474094113979633724";
const FOUNDER_ID = "1472696242583900332";

client.on("ready", () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.content === "!ticket") {

        const existing = message.guild.channels.cache.find(
            c => c.name === `ticket-${message.author.username}`
        );

        if (existing) {
            message.reply("Tu as déjà un ticket ouvert.");
            return;
        }

        const channel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,

            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: message.author.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
                {
                    id: FOUNDER_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                }
            ],
        });

        channel.send(`🎫 Ticket créé par ${message.author}`);
        message.reply(`Ticket créé : ${channel}`);
    }
});

client.login(TOKEN);
