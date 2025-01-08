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
const BotMakerDB = new Database("/Json-Database/BotMaker/Data.json");
// const coinsDB = new Database("/Json-Database/BotMaker/Balance.json");
const checkdb = new Database("/Json-Database/Others/BuyerChecker.json");
const logsdb = new Database("/Json-Database/DashBoard/Logs.json");
const blacklist = new Database("/Json-Database/DashBoard/Blacklisted");
const moment = require('moment-timezone');
const { Log } = require('../../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("buy-coins")
        .setDescription("Buy balance")
        .addIntegerOption(t => t
            .setName('amount')
            .setDescription(`Amount to buy`)
            .setRequired(true)),
    ownerOnly: false,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
    */
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

            const amount = interaction.options.getInteger(`amount`);
            const data = BotMakerDB.get(`BotMakerData_${interaction.guild.id}`);

            let blacklist = await blacklistSchema.findOne({ userid: interaction.user.id })
            if (blacklist) {
                return interaction.reply({ content: `❌ تم حظرك من استخدام خدماتنا تواصل مع الدعم لمعرفه المزيد من تفاصيل\nhttps://discord.gg/ebBXe2rGhu`, ephemeral: true })
            }

            const coinsPrice = BotMakerDB.get(`CoinsP_${interaction.guild.id}`) || 10;

            let price = coinsPrice * amount


            let adminlog = interaction.guild.channels.cache.get(Log)


            let totalPrice = Math.floor((price) * (20 / 19) + 1);

            if (!data) {
                return interaction.reply(`You cant use this command for now`);
            }

            const bank = data.bank;
            const probot = data.probot;
            if (!bank || !probot) {
                return interaction.reply(`You cant use this command for now`);
            }


            let embed = new EmbedBuilder()
                .setColor(`DarkButNotBlack`)
                .setDescription(`\`\`\`c ${bank} ${totalPrice} ${amount} Maker coins\`\`\``)
            let button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`copy`)
                        .setLabel(`Copy`)
                        .setStyle(ButtonStyle.Secondary)
                )

            let embed1 = new EmbedBuilder()
                .setColor(`Yellow`)
                .setTitle(`عمليه شراء`)
                .setDescription(`تم بدا عمليه شراء بواسطه ${interaction.user} عدد عملات \`${amount}\``)

            interaction.reply({ embeds: [embed], components: [button] }).then(async (msg) => {
                checkdb.set(`${interaction.user.id}_${interaction.guild.id}`, msg.id)

                let ad = null
                if (adminlog) {
                    ad = await adminlog.send({ embeds: [embed1] }).catch(err => { })
                }

                const filter = (response) =>
                    response.content.startsWith(
                        `**:moneybag: | ${interaction.user.username}, has transferred \`$${price}\``
                    ) &&
                    response.content.includes(`${bank}`) &&
                    response.author.id === probot &&
                    response.content.includes(Number(price));
                const filteruser = (i) => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    filteruser,
                    time: 120000,
                });

                collector.on("collect", async () => {
                    const check = checkdb.get(`${interaction.user.id}_${interaction.guild.id}`) || null
                    if (msg.id === check) {
                        let userdata = await balanceSchema.findOne({ userid: interaction.user.id, guild: interaction.guild.id })
                        if (userdata) {
                            userdata.balance += amount;
                        } else {
                            userdata = new balanceSchema({
                                userid: interaction.user.id,
                                guild: interaction.guild.id,
                                coins: amount,
                                balance: amount
                            });
                        }
                        userdata.save().then(() => {
                            let logId = logsdb.get(`LogID`) || 1
                            logsdb.push(`Logs_${interaction.user.id}`, {
                                id: logId,
                                reason: `شحن رصيد`,
                                amount: amount,
                                status: 'success',
                                action: 'اضافه',
                                date: moment().format('YYYY-MM-DD hh:mm'),
                            }).then(() => {
                                logsdb.set(`LogID`, logId + 1)
                            })
                            interaction.channel.send(`${interaction.user}, Added \`${amount}\` Maker coins to your balance!`);

                            checkdb.delete(`${interaction.user.id}_${interaction.guild.id}`);
                            const doneEmbed = new EmbedBuilder()
                                .setColor('Green')
                                .setDescription(`\`\`\`c ${bank} ${totalPrice}\`\`\``)
                            msg.edit({ embeds: [doneEmbed], components: [] })

                            let embed = new EmbedBuilder()
                                .setColor(`Green`)
                                .setTitle(`عمليه شراء`)
                                .setDescription(`تم شراء \`${amount}\` بواسطه ${interaction.user}`)
                            if (ad) {
                                ad.edit({ embeds: [embed] }).catch(err => { })
                            }
                        }).catch(error => {
                            interaction.channel.send(`Pending process, ${interaction.user}, amount \`${amount}\``);
                            checkdb.delete(`${interaction.user.id}_${interaction.guild.id}`);
                            const doneEmbed = new EmbedBuilder()
                                .setColor('Yellow')
                                .setDescription(`\`\`\`c ${bank} ${totalPrice}\`\`\``)
                            msg.edit({ embeds: [doneEmbed], components: [] })

                            let embed = new EmbedBuilder()
                                .setColor(`Yellow`)
                                .setTitle(`عمليه شراء معلقه`)
                                .setDescription(`الكميه: \`${amount}\`\nالعضو: ${interaction.user}`)
                            if (ad) {
                                ad.edit({ embeds: [embed] }).catch(err => { })
                            }
                        });

                    } else {
                        const doneEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`\`\`\`c ${bank} ${totalPrice}\`\`\``)
                        msg.edit({ embeds: [doneEmbed], components: [] })
                        let embed = new EmbedBuilder()
                            .setColor(`Red`)
                            .setTitle(`عمليه شراء`)
                            .setDescription(`فشلت عمليه شراء بواسطه ${interaction.user} بسبب استخدام امر شراء اكثر من مره`)
                        if (ad) {
                            ad.edit({ embeds: [embed] }).catch(err => { })
                        }
                    }
                    collector.stop()
                    return
                });


                collector.on("end", (collected) => {
                    if (collected.size !== 0) {
                        return
                    } else {
                        let embed = new EmbedBuilder()
                            .setColor(`Red`)
                            .setTitle(`عمليه شراء`)
                            .setDescription(`فشلت عمليه شراء بواسطه ${interaction.user} بسبب انتهاء مده التحويل`)
                        if (ad) {
                            ad.edit({ embeds: [embed] }).catch(err => { })
                        }
                        checkdb.delete(`${interaction.user.id}_${interaction.guild.id}`);
                        const doneEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`\`\`\`c ${bank} ${totalPrice}\`\`\``)
                        if (ad) {
                            msg.edit({ embeds: [doneEmbed], components: [] })
                        }

                        return interaction.channel.send(`الوقت قد انتهي لا تقم بالتحويل ${interaction.user}`).catch(err => { })
                    }
                });

            })
        } catch (error) {
            console.log(error)
            await interaction.reply(`Error executing this command. Try using the command again.`);
        }
    },
};