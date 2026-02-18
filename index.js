// index.js
require('dotenv').config(); // Pour récupérer les variables d'environnement

const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Initialisation du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

// Connexion avec le token depuis les variables d'environnement
client.login(process.env.BOT_TOKEN);

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Commandes basiques pour test
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.channel.send('Pong !');
    }

    if (message.content === '!salut') {
        message.channel.send(`Salut ${message.author.username} !`);
    }
});
