const {
    Client,
    Collection,
    Discord,
    createInvite,
    ChannelType,
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
    SlashCommandBuilder,
    REST,
    Routes,
    GatewayCloseCodes,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    Embed,
    ChatInputCommandInteraction
} = require("discord.js");

const moment = require('moment-timezone');
moment.tz.setDefault('Africa/Cairo');

const { Database } = require("st.db");
let aliasesdb = new Database('/Json-Database/Others/Aliases.json')
const Prices = new Database("/Json-Database/BotMaker/Prices.json");
const coinsDB = new Database("/Json-Database/BotMaker/Balance.json");
module.exports = {
    name: "modal-aliases",
    ownerOnly: false,
    /**
    * 
    * @param {ChatInputCommandInteraction} interaction 
    */
    run: async (client, interaction) => {
        try {
            let command = interaction.customId.split("_")[0]?.trim()
            let id = interaction.customId.split("_")[1]?.trim()
            let action = interaction.customId.split("_")[2]?.trim()
            let aliase = interaction.fields.getTextInputValue("aliase");
            const userdata = coinsDB.get(`Coins_${interaction.guild.id}_${interaction.user.id}`) || { Coins: 0 }
            let Coins = userdata.Coins
            let usercoins = Coins
            if (action == "add") {
                let price = Prices.get(`AliasesP`) || 1
                if (usercoins < price) return interaction.reply({ content: `⛔ | رصيدك غير كافي سعر إذافه اختصار جديد \`${price}\``, ephemeral: true }).catch(err => { })
                let check = aliasesdb.get(`${aliase}_${id}`) || null
                if (check == command) return interaction.reply({ content: `${interaction.user}, البوت الخاص بك لديه هذا الاختصار لامر الذي قمت باختياره بفعل` })
                
                coinsDB.set(`Coins_${interaction.guild.id}_${interaction.user.id}`, {
                    Coins: usercoins - price,
                }).then(() =>{
                    aliasesdb.set(`${aliase}_${id}`, command).then(() => {
                        interaction.reply({ content: `تم اضافه الاختصار بنجاح`, ephemeral: true })
                    })
                })
            } else if (action == "remove") {
                let check = aliasesdb.get(`${aliase}_${id}`) || null
                if (check != command) return interaction.reply({ content: `${interaction.user}, لا يوجد اي اختصارات للامر الذي اخترته` })
                aliasesdb.delete(`${aliase}_${id}`).then(() => {
                    interaction.reply({ content: `تم حذف الاختصار بنجاح`, ephemeral: true })
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
}