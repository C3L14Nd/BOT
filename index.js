const { PermissionsBitField, ChannelType } = require('discord.js');

const CATEGORY_ID = "ID_DE_TA_CATEGORIE"; // remplace par l'ID de ta catégorie
const FOUNDER_ID = "TON_ID_DISCORD"; // ton ID

client.on('messageCreate', async (message) => {

    if (message.content === "!ticket") {

        // Vérifie si ticket existe déjà
        const existing = message.guild.channels.cache.find(
            c => c.name === `ticket-${message.author.username}`
        );

        if (existing) {
            message.reply("Tu as déjà un ticket ouvert.");
            return;
        }

        // Création du salon
        const channel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,

            parent: CATEGORY_ID, // ← met dans la catégorie

            permissionOverwrites: [

                // cache à tout le monde
                {
                    id: message.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },

                // visible par la personne
                {
                    id: message.author.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },

                // visible par le fondateur (toi)
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
