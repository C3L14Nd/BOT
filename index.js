require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// VARIABLES ENVIRONNEMENT

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;
const TICKET_MESSAGE = process.env.TICKET_MESSAGE;
const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const BAD_WORDS = process.env.BAD_WORDS.split(",");


// BOT READY

client.once("ready", () => {

    console.log(`Connecté en tant que ${client.user.tag}`);

});


// ROLE AUTOMATIQUE

client.on("guildMemberAdd", async member => {

    try {

        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);

        if (role) {

            await member.roles.add(role);

            console.log("Role auto donné");

        }

        const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {

            logChannel.send(`${WELCOME_MESSAGE} ${member.user}`);

        }

    } catch (error) {

        console.log(error);

    }

});


// AUTO MODERATION

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (BAD_WORDS.some(word => content.includes(word))) {

        await message.delete();

        message.channel.send("Message supprimé")
        .then(msg => setTimeout(() => msg.delete(), 3000));

    }

});


// COMMANDE PANEL TICKET

client.on("messageCreate", async message => {

    if (message.content === "!panel") {

        const button = new ButtonBuilder()
            .setCustomId("ticket_create")
            .setLabel("Créer un ticket")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        message.channel.send({
            content: TICKET_MESSAGE,
            components: [row]
        });

    }

});


// CREATION TICKET

client.on("interactionCreate", async interaction => {

    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket_create") {

        const existing = interaction.guild.channels.cache.find(
            c => c.name === `ticket-${interaction.user.id}`
        );

        if (existing) {

            return interaction.reply({
                content: "Ticket déjà existant",
                ephemeral: true
            });

        }

        const channel = await interaction.guild.channels.create({

            name: `ticket-${interaction.user.id}`,

            type: ChannelType.GuildText,

            parent: TICKET_CATEGORY_ID,

            permissionOverwrites: [

                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },

                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }

            ]

        });

        interaction.reply({
            content: `Ticket créé : ${channel}`,
            ephemeral: true
        });

    }

});


// LOGIN

client.login(TOKEN);