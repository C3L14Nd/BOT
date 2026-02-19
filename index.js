require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    PermissionsBitField,
    ChannelType
} = require('discord.js');

// Vérification du token
const token = process.env.TOKEN;
if (!token) {
    console.error("❌ TOKEN introuvable dans les variables d'environnement !");
    process.exit(1);
} else {
    console.log("🔑 Token utilisé :", token.slice(0, 6) + "..." + token.slice(-4));
}

// Création du client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// Préfixe
const PREFIX = process.env.PREFIX || "!";
client.commands = new Collection();

// Liste des mots interdits
const forbiddenWords = ["badword1", "badword2"];

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

// Gestion des messages
client.on('messageCreate', async message => {

    if (message.author.bot) return;

    // Auto-modération
    for (const word of forbiddenWords) {
        if (message.content.toLowerCase().includes(word)) {

            await message.delete().catch(console.error);

            const warning = await message.channel.send(
                `${message.author}, ton message a été supprimé : mot interdit détecté.`
            );

            setTimeout(() => warning.delete().catch(() => {}), 5000);

            return;
        }
    }

    // Vérification préfixe
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Commande ping
    if (command === "ping") {
        message.channel.send("🏓 Pong !");
    }

    // Commande ticket
    if (command === "ticket") {

        const guild = message.guild;

        try {
            const channel = await guild.channels.create({
                name: `ticket-${message.author.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: message.author.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ],
                    },
                    {
                        id: process.env.ADMIN_ROLE,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ],
                    }
                ]
            });

            channel.send(`🎫 Bonjour ${message.author}, votre ticket est ouvert !`);

        } catch (error) {
            console.error("Erreur création ticket :", error);
        }
    }

});

// Connexion
client.login(token);
