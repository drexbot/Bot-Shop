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
  PermissionFlagsBits
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");

const { Database } = require("st.db");
const BotMakerDB = new Database("/Json-Database/BotMaker/Data.json");
const botPrices = new Database("/Json-Database/BotMaker/Prices.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("setup botmaker system")
    .addChannelOption(c => c
      .setName('channel')
      .setDescription(`The channel where the botmaker ticket will be sended to.`)
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
    )
    .addChannelOption(c => c
      .setName('sell-logs')
      .addChannelTypes(ChannelType.GuildText)
      .setDescription(`Select the sell logs channel`)
      .setRequired(true)
    )
    .addRoleOption(c => c
      .setName('role')
      .setDescription(`The role which the buyer will get after buying`)
      .setRequired(true)
    )
    .addUserOption(u => u
      .setName('bank')
      .setDescription('Select the bank acount')
      .setRequired(true))
    .addUserOption(u => u
      .setName('probot')
      .setDescription('Select the probot bot')
      .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  ,
  ownerOnly: true,
  async run(client, interaction) {
    try {
      const channel = interaction.options.getChannel('channel')
      const sellslog = interaction.options.getChannel('sell-logs').id
      const role = interaction.options.getRole('role').id
      const bank = interaction.options.getUser('bank').id
      const probot = interaction.options.getUser('probot').id

      const Bots_Selector = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("Botmaker_Selector")
          .setPlaceholder("Create your professional bot")
          .setOptions([
            {
              label: "Buy bots",
              value: "buybots_Selected",
              description: "شراء بوتات",
            },
           {
              label: "Build Bot",
              value: "buildbot_Selected",
              description: "بناء بوت",
            }  
          ])
      );

      let botCommands = []
      let AutolineP = botPrices.get("Autoline" + "P_" + interaction.guild.id) || 1
      let SuggestionP = botPrices.get("Suggestion" + "P_" + interaction.guild.id) || 1
      let TaxP = botPrices.get("Tax" + "P_" + interaction.guild.id) || 1
      let SystemP = botPrices.get("System" + "P_" + interaction.guild.id) || 1
      let FeedbackP = botPrices.get("Feedback" + "P_" + interaction.guild.id) || 1
      let TicketP = botPrices.get("Ticket" + "P_" + interaction.guild.id) || 1
      let GiveawayP = botPrices.get("Giveaway" + "P_" + interaction.guild.id) || 1
      let ProtectionP = botPrices.get("Protection" + "P_" + interaction.guild.id) || 1
      let ApplyP = botPrices.get("Apply" + "P_" + interaction.guild.id) || 1
      let LogP = botPrices.get("Log" + "P_" + interaction.guild.id) || 1
      let SelfroleP = botPrices.get("Selfrole" + "P_" + interaction.guild.id) || 1
      let PackageP = botPrices.get("Package" + "P_" + interaction.guild.id) || 1


      let message =
        `### - شراء بوتات ديسكورد جاهزة :
> **جميع البوتات اشتراكات شهرية
> مالك البوت لديه كامل الصلاحية في بوته الخاص
> جميع البوتات تكون في تحديث ومراقبة مستمرة
> جميع البوتات بنسبة 99% اونلاين من دون انقطاع**

### - أسعار البوتات:
> **خط تلقائي**: ${AutolineP} عمله
> **إقترحات**: ${SuggestionP} عمله
> **ضريبه**: ${TaxP} عمله
> **إداره**: ${SystemP} عمله
> **آراء**: ${FeedbackP} عمله
> **تذاكر**: ${TicketP} عمله
> **هدايا**: ${GiveawayP} عمله
> **حمايه**: ${ProtectionP} عمله
> **تقديمات**: ${ApplyP} عمله
> **لوقات**: ${LogP} عمله
> **تجميع رتب**: ${SelfroleP} عمله
> **بكج بوت**: ${PackageP} عمله 
`

      const themessage = message.replace(/\\n/g, '\n');
      const embed = new EmbedBuilder()
        // .setColor(interaction.guild.members.me.displayHexColor)
        .setColor("#ffffff")
        .setThumbnail(interaction.guild.iconURL({ format: "png", dynamic: true, size: 128 }))
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ format: "png", dynamic: true, size: 128 }) })
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ format: "png", dynamic: true, size: 128 }) })
        .setDescription(themessage)
        .setImage("https://media.discordapp.net/attachments/1244223738254463007/1244251353111466036/df451872-dbc9-41fb-99ee-aac963dbb735.png")

      channel.send({ embeds: [embed], components: [Bots_Selector] }).then(() => {
        interaction.reply({ content: `Done setuped botmaker system.`, ephemeral: true })
        BotMakerDB.set(`BotMakerData_${interaction.guild.id}`, {
          channel: channel.id,
          sellslog: sellslog,
          role: role,
          bank: bank,
          probot: probot,
          message: message
        })
      })

    } catch (error) {
      console.error("Error executing this command:", error);
      await interaction.reply("Error executing this command.");
    }
  },
};

