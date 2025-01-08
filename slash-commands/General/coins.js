const {
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
  EmbedBuilder
} = require("discord.js");

const { SlashCommandBuilder } = require("@discordjs/builders");

const { Database } = require("st.db");
// const coinsDB = new Database("/Json-Database/BotMaker/Balance.json");
const blacklist = new Database("/Json-Database/DashBoard/Blacklisted");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coins")
    .setDescription("Check someone blanace")
    .addUserOption(u => u
      .setName('user')
      .setDescription(`The user`)
      .setRequired(false))
  ,
  ownerOnly: false,
  async run(client, interaction) {
    try {
      const balanceSchema = require('../../Schema/Balance');
      if (Object.keys(balanceSchema).length > 0) { } else {
        return interaction.reply(
          {
            content: `Database error 109 try again later...`
          }
        )
      }
      const blacklistSchema = require('../../Schema/Blacklist');
      if (Object.keys(blacklistSchema).length > 0) { } else {
        return interaction.reply(
          {
            content: `Database error 109 try again later...`,
          }
        )
      }
      const userOption = interaction.options.getUser("user");
      const member = userOption ? userOption : interaction.user;


      let userdata = await balanceSchema.findOne({ userid: member.id, guild: interaction.guild.id })
      let usercoins = userdata?.balance || 0

      let blacklist = await blacklistSchema.findOne({ userid: member.id })
      if (blacklist && interaction.user.id == member.id) {
        return interaction.reply({ content: `❌ تم حظرك من استخدام خدمات ريبل تواصل مع الدعم لمعرفه المزيد من تفاصيل\nhttps://discord.gg/ebBXe2rGhu`, ephemeral: true })
      } else if (blacklist && interaction.user.id != member.id) {
        interaction.reply(`${member.username} have \`0\` Super coins`);
      }

      if (usercoins === 0 && member.id === interaction.user.id) {
        interaction.reply(`You dont have balance. use </buy-coins:1145807782692528148> to buy`);
      } else if (member.id == interaction.user.id && usercoins != 0) {
        interaction.reply(`you have \`${usercoins}\` Maker coins`);
      } else {
        interaction.reply(`${member.username} have \`${usercoins}\` Maker coins`);
      }
    } catch (error) {
      await interaction.reply(`Error executing this command. You can use the command again`);
    }
  },
};

