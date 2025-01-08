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
    ChatInputCommandInteraction
} = require("discord.js");

const { Database } = require("st.db");
const coinsDB = new Database("/Json-Database/BotMaker/Balance.json");
const priceDB = new Database("/Json-Database/BotMaker/Prices.json");
let config = require("../../config.json")

module.exports = {
    name: "buybot-Selector",
    description: "",
    usage: [""],
    botPermission: [""],
    authorPermission: [""],
    cooldowns: [0],
    ownerOnly: false,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            const balanceSchema = require('../../Schema/Balance');
            const Selected = interaction.values[0];

            let args;
            if (Selected === 'Autoline_Selected') args = { type: "Autoline", priceKey: "AutolineP", name: "خط تلقائي" }
            if (Selected === 'Suggestion_Selected') args = { type: "Suggestion", priceKey: "SuggestionP", name: "إقترحات" }
            if (Selected === 'Tax_Selected') args = { type: "Tax", priceKey: "TaxP", name: "ضريبه" }
            if (Selected === 'System_Selected') args = { type: "System", priceKey: "SystemP", name: "إداره" }
            if (Selected === 'Ticket_Selected') args = { type: "Ticket", priceKey: "TicketP", name: "تذاكر" }
            if (Selected === 'Giveaway_Selected') args = { type: "Giveaway", priceKey: "GiveawayP", name: "هدايا" }
            if (Selected === 'Feedback_Selected') args = { type: "Feedback", priceKey: "FeedbackP", name: "آراء" }
            if (Selected === 'Protection_Selected') args = { type: "Protection", priceKey: "ProtectionP", name: "حمايه" }
            if (Selected === 'Apply_Selected') args = { type: "Apply", priceKey: "ApplyP", name: "تقديمات" }
            if (Selected === 'Log_Selected') args = { type: "Log", priceKey: "LogP", name: "سجلات" }
            if (Selected === 'Selfrole_Selected') args = { type: "Selfrole", priceKey: "SelfroleP", name: "جمع رتب" }
            if (Selected === 'Package_Selected') args = { type: "Package", priceKey: "PackageP", name: "بوت بكج" }

            let userdata = await balanceSchema.findOne({ userid: interaction.user.id, guild: config.MainGuild })
            let usercoins = userdata?.balance || 0 // استخدام نفس الطريقة لجلب الرصيد

            const botPrice = priceDB.get(`${args.priceKey}_${interaction.guild.id}`) || 1
            if (usercoins < botPrice) return interaction.reply({ content: `⛔ | سعر بوت ${args.name} \`${botPrice}\` رصيدك غير كافئ`, ephemeral: true })

            const embed = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setDescription(`سيتم خصم من رصيدك \`${botPrice}\` لشراء بوت **${args.name}**`)

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${args.type}_continue`)
                        .setStyle(ButtonStyle.Success)
                        .setLabel("شراء"),

                    new ButtonBuilder()
                        .setCustomId("cancel_purchase")
                        .setStyle(ButtonStyle.Danger)
                        .setLabel("إلغاء")
                );

            interaction.reply({ embeds: [embed], components: [button], ephemeral: true }).then(async (msg) => {
                const collector = interaction.channel.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 10000,
                    max: 1,
                });
                collector.on("collect", async (i) => {
                    await msg.delete().catch(error => { })
                });
                collector.on("end", (collected) => {
                    if (collected.size === 0) {
                        if (msg) {
                            msg.delete().catch(error => { })
                        }
                    }
                });
            })
        } catch (error) {
            console.log(error)
        }
    }
}
