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
const coinsDB = new Database("/Json-Database/BotMaker/Balance.json");

const logsdb = new Database("/Json-Database/DashBoard/Logs.json");
const moment = require('moment-timezone');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-coins")
        .setDescription("Add Super coins to user")
        .addUserOption(u => u
            .setName('user')
            .setDescription('The user')
            .setRequired(true))
        .addIntegerOption(n => n
            .setName('amount')
            .setDescription('The amount to add')
            .setRequired(true))
        .addStringOption(s => s
            .setName("reason")
            .setDescription('reason'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    ownerOnly: true,
    async run(client, interaction) {
        try {
            const balanceSchema = require('../../Schema/Balance');
            if (Object.keys(balanceSchema).length > 0) { } else {
                return interaction.reply(
                    {
                        content: `Database error 109 try again later...`,
                    }
                )
            }
            const user = interaction.options.getUser('user').id
            const amount = interaction.options.getInteger('amount')
            const reason = interaction.options.getString('reason') || `لم يتم تحديد سبب`


            let action = 'اضافه'
            let status = 'success'
            if (amount < 0) action = 'خصم', status = 'danger'
            
            let userdata = await balanceSchema.findOne({ userid: user, guild: interaction.guild.id })
            if (userdata) {
                userdata.balance += amount;
            } else {
                userdata = new balanceSchema({
                    userid: user,
                    guild: interaction.guild.id,
                    coins: amount,
                    balance: amount
                });
            }
            userdata.save().then(() => {
                let logId = logsdb.get(`LogID`) || 1
                logsdb.push(`Logs_${user}`, {
                    id: logId,
                    reason: reason,
                    amount: Math.abs(amount),
                    status: status,
                    action: action,
                    date: moment().format('YYYY-MM-DD hh:mm'),
                }).then(() => {
                    logsdb.set(`LogID`, logId + 1)
                })
                interaction.reply(`Added \`${amount}\` Maker coins to <@!${user}>`);
            }).catch(error => {
                interaction.reply(`Error occurred while adding the balance to user`);
            });

        } catch (error) {
            console.error("Error executing this command:", error);
            await interaction.reply("Error executing this command.");
        }
    },
};

