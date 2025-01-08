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

const { Database } = require("st.db");
const Prices = new Database("/Json-Database/BotMaker/Prices.json");
const IdsData = new Database("/Json-Database/BotMaker/IDs.json");

const db2 = new Database("/Json-Database/Others/Tokens.json");

const prefixDB = new Database("/Json-Database/Others/PrefixData");
const OwnerDB = new Database("/Json-Database/Others/OwnerData");
const BotMakerDB = new Database("/Json-Database/BotMaker/Data");
const TokenDB = new Database("/Json-Database/Others/UnusedTokens.json");
const runDB = new Database("/Json-Database/BotMaker/RunBots.json");
const config = require('../../config.json')
const commands = new Database('/commands.json')
let botbuildingdb = new Database('/Json-Database/Others/Building.json')
module.exports = {
    name: "modal-purches-bot",
    ownerOnly: false,
    /**
    * 
    * @param {ChatInputCommandInteraction} interaction 
    */
    run: async (client, interaction) => {
        try {
            const balanceSchema = require('../../Schema/Balance');

            let type = interaction.customId.split("_")[0]?.trim()
            let botCommands = []

            let configCommands = commands.get('config')
            botCommands.push(...configCommands)
            let args;
            if (type === 'Autoline') args = { priceKey: "AutolineP", name: "خط تلقائي", commands: commands.get('Autoline').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Suggestion') args = { priceKey: "SuggestionP", name: "إقترحات", commands: commands.get('Suggestion').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Tax') args = { priceKey: "TaxP", name: "ضريبه", commands: commands.get('Tax').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'System') args = { priceKey: "SystemP", name: "إداره", commands: commands.get('System').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Ticket') args = { priceKey: "TicketP", name: "تذاكر", commands: commands.get('Ticket').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Giveaway') args = { priceKey: "GiveawayP", name: "هدايا", commands: commands.get('Giveaway').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Feedback') args = { priceKey: "FeedbackP", name: "آراء", commands: commands.get('Feedback').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Protection') args = { priceKey: "ProtectionP", name: "حمايه", commands: commands.get('Protection').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Apply') args = { priceKey: "ApplyP", name: "تقديمات", commands: commands.get('Apply').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Log') args = { priceKey: "LogP", name: "سجلات", commands: commands.get('Log').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Selfrole') args = { priceKey: "SelfroleP", name: "جمع رتب", commands: commands.get('Selfrole').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Package') args = { priceKey: "PackageP", name: "بوت بكج", commands: commands.get('commandPackage').forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }
            if (type === 'Custom') args = { priceKey: "Custom", name: "بوت خاص", commands: botbuildingdb.get(`buildBot_${interaction.user.id}`).forEach(comID => { let com = commands.get(comID); botCommands.push(com) }) }


            const NodeID = IdsData.get(`NodeID`) || 1
            await interaction.deferReply({ ephemeral: true });
            let usercoins = 0
            let userdata = await balanceSchema.findOne({ userid: interaction.user.id, guild: config.MainGuild })
            usercoins = userdata?.balance || 0

            let botPrice = 0
            if (args.priceKey != 'Custom') botPrice = Prices.get(`${args.priceKey}_${interaction.guild.id}`) || 1
            else botCommands.forEach(com => { botPrice = botPrice + com.price })
            
            
            let adminlog = interaction.guild.channels.cache.get(config.Log)
            
            if (usercoins < botPrice) return interaction.editReply({ content: `⛔ | سعر بوت ${args.name} \`${botPrice}\` رصيدك غير كافئ`, ephemeral: true }).catch(err => { })
            const prefix = interaction.fields.getTextInputValue("prefix");
            const owner = interaction.fields.getTextInputValue("owner") || interaction.user.id;
            if (isNaN(owner)) return interaction.editReply({ content: `⛔ | قمت بإدخال ايدي مالك البوت بطريقه خطأ\nexe : **1053946865659420692**`, ephemeral: true })
            if (prefix === '/') return interaction.editReply({ content: `⛔ | لا يمكنك إختيار \`/\` لتكون بادئه للبوت`, ephemeral: true })



            const data = await BotMakerDB.get(`BotMakerData_${interaction.guild.id}`)
            const logs = data.sellslog
            const logchannel = await client.channels.cache.get(logs);


            userdata.balance = userdata.balance - +botPrice;
            userdata.coins = userdata.balance - +botPrice;
            userdata.save().then(async () => {
                interaction.editReply({ content: `⏳ | سيتم إرسال البوت إليك خلال ثواني`, ephemeral: true })

                const BotID = IdsData.get(`${type}ID`) || 1
                const purchasesID = IdsData.get(`PurchasesID`) || 1
                IdsData.set(`${type}ID`, BotID + 1).then(() => {
                    IdsData.set(`PurchasesID`, purchasesID + 1)
                })


                const tokens = TokenDB.get(`TOKENS`) || []
                if (tokens.length <= 20) {
                    if (adminlog) {
                        let embed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle(`تحذير`)
                            .setDescription(`متبقي فقط ${tokens.length - 1} توكن غير مستخدم`)
                            .setTimestamp()
                        adminlog.send({ embeds: [embed] })
                    }
                }
                const token = tokens[0]
                TokenDB.pull(`TOKENS`, token)
                const client1 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,] });
                client1.login(token).then(async () => {
                    const buyerembed = new EmbedBuilder()
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setTitle(`Your ${type} bot is ready`)
                        .setDescription(`Owner: ${owner}\n\nClientID: ${client1.user.id}\n\nPrefix: ${prefix}\n\nBot's username: ${client1.user.username}\n\nPurchase ID: ${purchasesID}`)
                        .setColor('DarkButNotBlack')
                        .setTimestamp(Date.now())

                    const invite_Button = new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client1.user.id}&permissions=8&scope=bot%20applications.commands`)
                            .setLabel(`invite`)
                            .setDisabled(false),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://canary.discord.com/channels/${config.Server}/${config.Rate}`)
                            .setLabel(`Rate us`)
                            .setDisabled(false),
                    ]);



                    if (data.role) {
                        try {
                            await interaction.member.roles.add(data.role)
                        } catch (error) {

                        }
                    }

                    if (logs) {
                        try {
                            logchannel.send({ content: `__${type}__ bot has been purchased by ${interaction.user.username}.` });
                        } catch (error) {
                        }
                    }

                    const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    const endTime = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss');

                    interaction.user.send({ embeds: [buyerembed], components: [invite_Button] }).catch(err => {
                        const invite_Button = new ActionRowBuilder().addComponents([
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client1.user.id}&permissions=8&scope=bot%20applications.commands`)
                                .setLabel(`invite`)
                                .setDisabled(false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setURL(`https://canary.discord.com/channels/${config.Server}/${config.Rate}`)
                                .setLabel(`Rate us`)
                                .setDisabled(false),
                            new ButtonBuilder()
                                .setCustomId(`resendbot_${interaction.user.id}`)
                                .setStyle(ButtonStyle.Success)
                                .setLabel(`Resend`)
                                .setDisabled(false),
                        ]);
                        if (adminlog) {
                            let embed = new EmbedBuilder()
                                .setColor('DarkBlue')
                                .setTitle(`حدث خطا اثناء إرسال فاتره بوت الي العميل`)
                                .setDescription(`العميل : ${interaction.user}\nالسبب : الخاص مقفل`)
                                .setTimestamp()
                            adminlog.send({ embeds: [embed, buyerembed], components: [invite_Button] })
                        }
                    })


                    db2.push(`Bots`, {
                        Token: token,
                        Owner: owner,
                        ClientID: client1.user.id,
                        Seller: interaction.guild.id,
                        BotID: BotID,
                        Type: type,
                        Price: botPrice,
                        Node: NodeID,
                        PurchasesID: purchasesID,
                        endTime: endTime,
                        startTime: startTime
                    }).then(() => {
                        prefixDB.set(`Prefix_${client1.user.id}`, prefix).then(() => {
                            OwnerDB.set(`Owner_${client1.user.id}`, owner).then(() => {
                                const commandsData = new Database(`/Json-Database/CommandsData/BotsCommands_${client1.user.id}.json`);
                                commandsData.set(`commands_${client1.user.id}`, botCommands)
                            }).then(() => {
                                runDB.push(`RunBot`, client1.user.id)
                            })
                        })
                    })

                }).catch(async error => {
                    console.log(`${error}\nToken: ${token}`)
                    interaction.editReply({ content: `❗ | حدث خطأ اثناء إكمال عمليه الشراء\nحدث خطأ اثناء إرجاع العملات الي حسابك` })
                })

            })
        } catch (error) {
            console.log(error)
        }
    }
}