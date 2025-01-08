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
const botPrices = new Database("/Json-Database/BotMaker/Prices.json");
const BotMakerDB = new Database("/Json-Database/BotMaker/Data.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("change-price")
        .setDescription("Add Super coins to user")
        .addStringOption(type => type
            .setName("bot")
            .setDescription("Pick bot")
            .setRequired(true)
            .addChoices(
                {name: "Autoline", value: "Autoline"},
                {name: "Suggestion", value: "Suggestion"},
                {name: "Tax", value: "Tax"},
                {name: "Feedback", value: "Feedback"},
                {name: "System", value: "System"},
                {name: "Ticket", value: "Ticket"},
                {name: "Giveaway", value: "Giveaway"},
                {name: "Protection", value: "Protection"},
                {name: "Apply", value: "Apply"},
                {name: "Log", value: "Log"},
                {name: "Selfrole", value: "Selfrole"},
                {name: "Aliases", value: "Aliases"},
                {name: "Language", value: "Language"},
                {name: "Coins", value: "Coins"},
            ))
            .addIntegerOption(number => number
                .setName("price")
                .setDescription("The price")
                .setRequired(true)
                .setMinValue(1))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    ownerOnly: true,
    async run(client, interaction) {
        try {
            const bot = interaction.options.getString('bot')
            const price = interaction.options.getInteger('price')
            if(bot != 'Coins'){
                botPrices.set(bot + "P_" + interaction.guild.id, price).then(() =>{
                    interaction.reply({content: `Bot ${bot}'s price changed to \`${price}\``})
                })
            }else{
            BotMakerDB.set(`CoinsP_${interaction.guild.id}`, price).then(() =>{
                interaction.reply({content: `${bot} price changed to \`${price}\``})
            })
            }
        } catch (error) {
            console.error("Error executing this command:", error);
            await interaction.reply("Error executing this command.");
        }
    },
};

