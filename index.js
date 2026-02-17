const fs = require('fs');
const { 
    Client, 
    GatewayIntentBits, 
    Events, 
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

// Lecture fichiers
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_ID_FONDATEUR = process.env.ROLE_ID_FONDATEUR;

const CATEGORY_NAME = "Gestion";
const CHANNEL_NAME = "problèmes-membres";
const GENERAL_CHANNEL = "bot";

const INSULTES = ["merde", "salope", "connard"];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Slash command
const commands = [
    new SlashCommandBuilder()
        .setName('probleme')
        .setDescription('Signaler un problème')
];

client.once(Events.ClientReady, async c => {

    console.log(`Connecté en tant que ${c.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
        console.log("Serveur introuvable");
        return;
    }

    await guild.commands.set(commands);

    console.log("Commandes enregistrées");

    const general = guild.channels.cache.find(
        ch => ch.name === GENERAL_CHANNEL && ch.type === ChannelType.GuildText
    );

    if (general)
        general.send("Je suis en ligne !");
});


// Détection insultes
client.on(Events.MessageCreate, message => {

    if (message.author.bot) return;

    const contenu = message.content.toLowerCase();

    if (INSULTES.some(mot => contenu.includes(mot))) {

        message.reply("Attention à ton langage.");
    }

});


// Commande /probleme
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'probleme') {

        const guild = interaction.guild;

        if (!guild) return;

        const category = guild.channels.cache.find(
            c => c.name === CATEGORY_NAME && c.type === ChannelType.GuildCategory
        );

        if (!category) {

            interaction.reply({
                content: "Catégorie introuvable",
                ephemeral: true
            });

            return;
        }

        let channel = guild.channels.cache.find(
            c => c.name === CHANNEL_NAME && c.parentId === category.id
        );

        if (!channel) {

            channel = await guild.channels.create({

                name: CHANNEL_NAME,
                type: ChannelType.GuildText,
                parent: category.id,

                permissionOverwrites: [

                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },

                    {
                        id: ROLE_ID_FONDATEUR,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }

                ]

            });

        }

        await channel.send({

            content:
            `Nouveau problème\n\n` +
            `Utilisateur: ${interaction.user.tag}\n` +
            `ID: ${interaction.user.id}\n` +
            `<@&${ROLE_ID_FONDATEUR}>`

        });

        interaction.reply({

            content: "Ticket envoyé",
            ephemeral: true

        });

    }

});


client.login(TOKEN);
