const config = require("../config.json")
const { Discord, EmbedBuilder, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { Database } = require("st.db")
const moment = require('moment');
const _ = require('lodash');
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const db222 = new Database("/Json-Database/Others/Expired.json");

let giveawaydb = new Database("./Bot/Json-Database/Settings/Giveaway.json")
const protectiondb = new Database("./Bot/Json-Database/Settings/Protection.json")
const applydb = new Database("./Bot/Json-Database/Settings/Apply.json")
const selfroledb = new Database("./Bot/Json-Database/Systems/Selfrole.json")
let ticketdb = new Database("./Bot/Json-Database/Settings/Ticket.json")
let ticketdb2 = new Database("./Bot/Json-Database/Settings/TempTicket.json")
module.exports.run = async (client) => {
    try {
        // Bot status Start
        console.log(require(`chalk`).green(`-  ${client.user.username} ONLINE`));
        // Bot status End

        // Expired system Start
        setInterval(() => {
            let status = db222.get(`Expired_${client.user.id}`) || null
            if(status){
                db222.delete(`Expired_${client.user.id}`)
                client.guilds.cache.forEach(guild => {
                    guild.leave().catch()
                    client.user.setAvatar(null)
                    setTimeout(() => {
                        client.destroy()
                    }, 10000)
                });
            }
        }, 5000)
        // Expired system End


        // Giveaway System Start
        try {
            setInterval(async () => {
                const language = await Botlanguage.get(client.user?.id) || "EN"
                const reply = await messages.get(language)
                const Timer = giveawaydb.get("RunningGiveaway_" + client.user?.id) || [];
                if (Timer.length > 0) {
                    for (const data2 of Timer) {
                        let time = data2.Time;
                        const Message = data2.messageID;
                        const GuildID = data2.guild
                        const Winners = data2.Winners
                        const Prize = data2.Prize
                        const guild = client.guilds.cache.get(data2.guild);
                        if (!guild) continue
                        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

                        const giveawaychannel = client.channels.cache.get(data2.Channel)
                        if (!giveawaychannel) continue
                        const giveawaymessage = giveawaychannel.messages.cache.get(data2.messageID)
                        if (!giveawaymessage) continue
                        if (moment(currentTime).isAfter(time) && data2.Status === "false" && data2.Ended === "true") {
                            continue;
                        } else if (moment(currentTime).isAfter(time) && data2.Status === "true" && data2.Ended === "false") {
                            const winnersCount = Winners
                            const participants = giveawaydb.get(GuildID + "_" + Message + "_Members")
                            const winners = _.sampleSize(participants, Math.min(winnersCount, participants?.length));

                            let winners2 = []
                            let winners3 = []
                            winners.forEach(async winner => {
                                winners2.push("<@!" + winner + ">")
                                winners3.push(`${winner}`)
                            })


                            if (winners2.length > 0) {
                                data2.winner = winners2;
                                data2.Reroll = winners3;
                                giveawaychannel.send({ content: `${reply.Giveaway.Reply9.replace("[WINNERS]", winners2).replace("[PRIZE]", Prize)} [↗](${giveawaymessage.url})` })
                            } else {
                                giveawaychannel.send({ content: `${reply.Giveaway.Reply10} [↗](${giveawaymessage.url})` })
                            }


                            const GiveawayButton = new ActionRowBuilder().addComponents([
                                new ButtonBuilder()
                                    .setCustomId(`entries`)
                                    .setLabel(`View entries`)
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(false),
                            ]);

                            const embedMessage = giveawaymessage.embeds[0];
                            const updatedDes = embedMessage.description.replace("Ends", "Ended");
                            const updatedDescription = updatedDes.replace(/Winners: \*\*\d+\*\*/, "Winners: " + winners2 || '');

                            const embed = new EmbedBuilder()
                                .setColor(`DarkButNotBlack`)
                                .setTitle(giveawaymessage.embeds[0].title)
                                .setDescription(updatedDescription);

                            data2.Ended = "true";
                            data2.Status = "false";
                            giveawaymessage.edit({ embeds: [embed], components: [GiveawayButton] })
                            giveawaydb.set(data2.messageID + "_Data", {
                                Winner: winners2,
                                Reroll: winners3,
                                Prize: Prize,
                                channelID: data2.Channel
                            }).then(() => {
                                let gg = Timer.filter(s => s.messageID !== Message)
                                giveawaydb.set("RunningGiveaway_" + client.user?.id, gg)
                            })

                        }
                    }
                } else {

                }
            }, 7000);
        } catch (error) {
        }
        // Giveaway System End



        // Protection System Start
        try {
            setInterval(async () => {
                const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                const timer = protectiondb.get(`protectionTimer_${client.user.id}`) || []
                if (timer.length) {
                    timer.forEach(async data => {
                        const { ID, action, Time, server, Number } = data
                        if (moment(currentTime).isAfter(Time)) {
                            const Remove = timer.filter(re => moment(currentTime).isBefore(re.Time));
                            await protectiondb.set(`protectionTimer_${client.user.id}`, Remove).then(() => {

                                const userData = protectiondb.get("protectionData_" + action + "_" + server + "_" + ID + "_" + client.user.id) || 1
                                if (isNaN(userData)) return
                                protectiondb.set("protectionData_" + action + "_" + server + "_" + ID + "_" + client.user.id, userData - 1)
                            })
                        }
                    })
                }
            }, 5000)
        } catch (error) {
            console.log(error)
        }
        // Protection System End

        // Dashbaord Start

        // Ticket Start
        // Setup Start
        setInterval(() => {
            let data = ticketdb2.get(`Create_Panel_${client.user.id}`) || null
            if (data) {
                ticketdb2.delete(`Create_Panel_${client.user.id}`)
                let { guild, channel, gategory, role, message, welcome, messageType, welcomeType, buttonName, buttonColor, buttonEmoji } = data

                let server = client.guilds.cache.get(guild)
                if (!server) return
                let panal_channel = server.channels.cache.get(channel)
                if (!panal_channel) return

                let embed = new EmbedBuilder()
                    .setAuthor({ name: server.name, iconURL: server.iconURL({ dynamic: true }) })
                    .setColor(server.members.me.displayHexColor)
                    .setTimestamp()
                    .setDescription(message)
                    .setFooter({ text: server.name, iconURL: server.iconURL({ dynamic: true }) })

                const button = new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId(role + "_" + gategory + "_1" + "_ticket")
                        .setStyle(parseInt(buttonColor || 1))
                        .setLabel(buttonName)
                ]);
                if (buttonEmoji) {
                    button.components[0].setEmoji(buttonEmoji)
                }

                if (messageType.toLowerCase() == 'embed') {
                    panal_channel.send({ embeds: [embed], components: [button] }).then(async (msg) => {
                        ticketdb.set("ticketData_" + msg.id,
                            {
                                panal_channelID: channel,
                                panel_message: message,
                                buttonsData: {
                                    button1: {
                                        panal_categoryID: gategory,
                                        button_name: buttonName,
                                        button_color: buttonColor,
                                        button_emoji: buttonEmoji,
                                        support_role: role,
                                        modals: [],
                                        welcome: {
                                            message: welcome,
                                            type: welcomeType
                                        }
                                    }
                                },
                            }
                        )
                    }).catch(async (error) => {
                        console.log(error)
                        try {
                        } catch {
                        }
                    })
                } else {
                    panal_channel.send({ content: message, components: [button] }).then(async (msg) => {
                        ticketdb.set("ticketData_" + msg.id,
                            {
                                panal_channelID: channel,
                                panel_message: message,
                                buttonsData: {
                                    button1: {
                                        panal_categoryID: gategory,
                                        button_name: buttonName,
                                        button_color: buttonColor,
                                        button_emoji: buttonEmoji,
                                        support_role: role,
                                        modals: [],
                                        welcome: {
                                            message: welcome,
                                            type: welcomeType
                                        }
                                    }
                                },
                            }
                        )
                    }).catch(async (error) => {
                        console.log(error)
                        try {
                        } catch {
                        }
                    })
                }
            }
        }, 3000)
        // Setup End
        // Manage Start

        // Panel Start
        setInterval(async () => {
            let data = ticketdb2.get(`Manage_Panel_${client.user.id}`) || null
            if (data) {
                ticketdb2.delete(`Manage_Panel_${client.user.id}`)
                let { guild, panelID, channel, message, thumbnail, image } = data

                let server = client.guilds.cache.get(guild)
                if (!server) return
                let panal_channel = server.channels.cache.get(channel)
                if (!panal_channel) return
                let panel_message = await panal_channel.messages.fetch(panelID).catch(err => { })
                if (!panel_message) return

                if (panel_message.embeds[0]) {
                    let embed = new EmbedBuilder()
                        .setAuthor(panel_message.embeds[0].author)
                        .setColor(panel_message.embeds[0].color)
                        .setTimestamp(new Date(panel_message.embeds[0].timestamp))
                        .setDescription(message)
                        .setFooter(panel_message.embeds[0].footer)
                    if (image) embed.setImage(image)
                    if (thumbnail) embed.setThumbnail(thumbnail)
                    if (!image && panel_message.embeds[0].image) embed.setImage(panel_message.embeds[0].image.proxyURL)
                    if (!thumbnail && panel_message.embeds[0].thumbnail) embed.setThumbnail(panel_message.embeds[0].thumbnail.proxyURL)

                    panel_message.edit({ embeds: [embed] })
                } else {
                    panel_message.edit({ content: `${message}` })
                }


            }
        }, 3000)
        // Panel End

        // Button Start
        setInterval(async () => {
            let data = ticketdb2.get(`Manage_addbutton_${client.user.id}`) || null
            if (data) {
                ticketdb2.delete(`Manage_addbutton_${client.user.id}`)
                let { guild, panelID, channel, gategory, role, welcome, welcomeType, buttonName, buttonColor, buttonEmoji } = data

                let server = client.guilds.cache.get(guild)
                if (!server) return
                let panal_channel = server.channels.cache.get(channel)
                if (!panal_channel) return
                let panel_message = await panal_channel.messages.fetch(panelID).catch(err => { })
                if (!panel_message) return
                let ticketData = ticketdb.get("ticketData_" + panelID)

                let panalButton = panel_message.components[0].components
                if (panalButton.length >= 5) return

                ticketData.buttonsData[`button${panalButton.length + 1}`] = {
                    panal_categoryID: gategory,
                    button_name: buttonName,
                    button_color: buttonColor,
                    button_emoji: buttonEmoji,
                    support_role: role,
                    modals: [],
                    welcome: {
                        message: welcome,
                        type: welcomeType
                    }
                };
                let nbu = new ButtonBuilder()
                    .setCustomId(role + "_" + gategory + "_" + (panalButton.length + 1) + "_ticket")
                    .setLabel(buttonName)
                    .setStyle(parseInt(buttonColor))
                if (buttonEmoji) nbu.setEmoji(buttonEmoji)
                panalButton.push(nbu)

                await panel_message.edit({ components: [new ActionRowBuilder().addComponents(panalButton)] }).then(() => {
                    ticketdb.set("ticketData_" + panelID, ticketData)
                });
            }
        }, 3000)
        // Button End

        // Manage End
        // Ticket End

        // Protection Start
        setInterval(async () => {
            let data = protectiondb.get(`Protection_Add_Whitelist_${client.user.id}`) || []
            if (data.length != 0) {
                data.forEach(async (act, i) => {
                    let { server, action, user } = act
                    if (i == 0) {
                        let filteredData = data.filter(d => d.user != act.user && d.action != act.action && d.server != act.server)
                        protectiondb.set(`Protection_Add_Whitelist_${client.user.id}`, filteredData)
                    }
                    let guild = client.guilds.cache.get(server)
                    if (!guild) return
                    let member = await guild.members.fetch(user).catch((err) => { })
                    if (!member) return
                    let userData = protectiondb.get("whiteList_" + server + "_" + member.id + "_" + client.user.id) || []
                    if (userData.includes(action)) return
                    protectiondb.push("whiteList_" + server + "_" + member.id + "_" + client.user.id, action)
                })

            }
        }, 3000)
        // Protection End


        // Apply Start
        // Setup
        setInterval(async () => {
            let data = applydb.get(`Create_Applection_${client.user.id}`) || null
            if (data) {
                let { guild, applicationChannel, requestsChannel, applicationRole, applicationMessage, applicationMessageType, questions } = data
                applydb.delete(`Create_Applection_${client.user.id}`)
                const language = await Botlanguage.get(client.user?.id) || "EN"
                const reply = await messages.get(language)

                let ask1 = questions[0];
                let ask2 = questions[1];
                let ask3 = questions[2];
                let ask4 = questions[3];
                let ask5 = questions[4];


                let server = client.guilds.cache.get(guild)
                if (!server) return
                let Appchannel = await server.channels.fetch(applicationChannel).catch()
                if (!Appchannel) return

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(requestsChannel + "_" + applicationRole + "_apply")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("📝")
                            .setLabel(reply.Apply.ButtonName),
                    );

                if (applicationMessage) {
                    if (applicationMessageType == "embed") {
                        const embed = new EmbedBuilder()
                            .setColor(server.members.me.displayHexColor || `DarkButNotBlack`)
                            .setThumbnail(server.iconURL({ dynamic: true }))
                            .setFooter({ text: server.name, iconURL: server.iconURL({ dynamic: true }) })
                            .setAuthor({ name: server.name, iconURL: server.iconURL({ dynamic: true }) })
                            .setDescription(applicationMessage)

                        Appchannel.send({ embeds: [embed], components: [button] }).then((appmsg) => {
                            applydb.set("appData_" + appmsg.id + "_" + client.user.id, {
                                message: applicationMessage,
                                channel: applicationChannel,
                                ID: appmsg.id,
                                ask1: ask1,
                                ask2: ask2,
                                ask3: ask3,
                                ask4: ask4,
                                ask5: ask5,
                            })
                        })
                    } else {
                        Appchannel.send({ content: `${applicationMessage}`, components: [button] }).then((appmsg) => {
                            applydb.set("appData_" + appmsg.id + "_" + client.user.id, {
                                message: applicationMessage,
                                channel: applicationChannel,
                                ID: appmsg.id,
                                ask1: ask1,
                                ask2: ask2,
                                ask3: ask3,
                                ask4: ask4,
                                ask5: ask5,
                            })
                        })
                    }
                } else {
                    Appchannel.send({ components: [button] }).then((appmsg) => {
                        applydb.set("appData_" + appmsg.id + "_" + client.user.id, {
                            message: "",
                            channel: applicationChannel,
                            ID: appmsg.id,
                            ask1: ask1,
                            ask2: ask2,
                            ask3: ask3,
                            ask4: ask4,
                            ask5: ask5,
                        })
                    })
                }

            }
        }, 3000)

        // Manage
        setInterval(async () => {
            let data = applydb.get(`Applection_Update_Data_${client.user.id}`) || null
            if (data) {
                let { guild, appStatus, appMessage, appID, questions } = data
                applydb.delete(`Applection_Update_Data_${client.user.id}`)

                let ask1 = questions[0];
                let ask2 = questions[1];
                let ask3 = questions[2];
                let ask4 = questions[3];
                let ask5 = questions[4];

                let appData = applydb.get(`appData_${appID}_${client.user.id}`) || null
                if (!appData) return
                if (appData.message != appMessage) {
                    let server = client.guilds.cache.get(guild)
                    if (!server) return
                    let Appchannel = await server.channels.fetch(appData.channel).catch()
                    if (!Appchannel) return
                    let applectionMessage = await Appchannel.messages.fetch(appData.ID)
                    if (!applectionMessage) return
                    if (applectionMessage.embeds[0]) {
                        let embed = new EmbedBuilder()
                            .setAuthor(applectionMessage.embeds[0].author)
                            .setColor(applectionMessage.embeds[0].color)
                            .setDescription(appMessage)
                            .setFooter(applectionMessage.embeds[0].footer)
                            .setThumbnail(applectionMessage.embeds[0].thumbnail.proxyURL)

                        applectionMessage.edit({ embeds: [embed] }).catch()
                        applydb.set("appData_" + appData.ID + "_" + client.user.id, {
                            message: appMessage,
                            channel: appData.channel,
                            ID: appData.ID,
                            ask1: ask1,
                            ask2: ask2,
                            ask3: ask3,
                            ask4: ask4,
                            ask5: ask5,
                        }).then(() => {
                            applydb.set("applectionStatus_" + appID + "_" + client.user.id, appStatus)
                        })
                    } else {
                        applectionMessage.edit({ content: `${appMessage}` }).catch()
                        applydb.set("appData_" + appData.ID + "_" + client.user.id, {
                            message: appMessage,
                            channel: appData.channel,
                            ID: appData.ID,
                            ask1: ask1,
                            ask2: ask2,
                            ask3: ask3,
                            ask4: ask4,
                            ask5: ask5,
                        }).then(() => {
                            applydb.set("applectionStatus_" + appID + "_" + client.user.id, appStatus)
                        })
                    }
                } else {
                    applydb.set("appData_" + appData.ID + "_" + client.user.id, {
                        message: appData.message || appMessage || '',
                        channel: appData.channel,
                        ID: appData.ID,
                        ask1: ask1,
                        ask2: ask2,
                        ask3: ask3,
                        ask4: ask4,
                        ask5: ask5,
                    }).then(() => {
                        applydb.set("applectionStatus_" + appID + "_" + client.user.id, appStatus)
                    })
                }

            }
        }, 3000)

        // Apply End


        // Selfrole Start
        setInterval(async () => {
            let data = selfroledb.get(`Create_Panel_${client.user.id}`) || null
            if (data) {
                let { guild, panelChannel, panelRole, panelType, panelMessage, panelMessageType, buttonColor, compName } = data
                selfroledb.delete(`Create_Panel_${client.user.id}`)
                const language = await Botlanguage.get(client.user?.id) || "EN"
                const reply = await messages.get(language)

                let server = client.guilds.cache.get(guild)
                if (!server) return

                let ch = await server.channels.fetch(panelChannel).catch()
                if (!ch) return

                let component;
                if (panelType == "buttons") {
                    component = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(panelRole + "_role")
                                .setStyle(parseInt(buttonColor))
                                .setLabel(compName),
                        );
                } else {
                    component = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("selfrolemenu")
                            .setPlaceholder(reply.Selfrole.Reply3)
                            .setOptions([
                                {
                                    label: compName,
                                    value: panelRole
                                }
                            ])
                    );
                }

                if (panelMessage) {
                    if (panelMessageType.toLowerCase() == "embed") {
                        const embed = new EmbedBuilder()
                            .setColor(server.members.me.displayHexColor || `DarkButNotBlack`)
                            .setThumbnail(server.iconURL({ dynamic: true }))
                            .setFooter({ text: server.name, iconURL: server.iconURL({ dynamic: true }) })
                            .setAuthor({ name: server.name, iconURL: server.iconURL({ dynamic: true }) })
                            .setDescription(panelMessage)

                        ch.send({ embeds: [embed], components: [component] })
                    }
                    else {
                        ch.send({ content: panelMessage, components: [component] })
                    }
                } else {
                    ch.send({ components: [component] })
                }

            }
        }, 3000)
        // Selfrole End

        // Dashbaord End
    } catch (error) {
        console.log(error)
    }
};
