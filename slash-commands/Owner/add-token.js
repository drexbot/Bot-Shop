const {
    Client,
    Collection,
    Discord,
    createInvite,
    WebhookClient,
    PermissionsBitField,
    GatewayIntentBits,
    Partials,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    Events,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ContextMenuCommandBuilder,
    REST,
    Routes,
    GatewayCloseCodes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-Database/Others/UnusedTokens.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-token")
        .setDescription("Add new bot token")
        .addStringOption(u => u
            .setName('token')
            .setDescription('token to add')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    ownerOnly: true,
    async run(client, interaction) {
        try {
            const token = interaction.options.getString('token')
            let check = db.get("TOKENS") || []
            if (check.includes(token)) return interaction.reply({ content: `هذا التوكن موجود بالفعل`, ephemeral: true })
            db.push('TOKENS', token).then(() => {
                interaction.reply({ content: `تم إضافه التوكن\`\`\`${token}\`\`\``, ephemeral: true })
            })
        } catch (error) {
            console.error( error);
            await interaction.reply("Error executing this command.");
        }
    },
};

