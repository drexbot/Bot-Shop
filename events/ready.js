const { Client, Collection, Discord, createInvite, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ChannelType, ActivityType, WebhookClient, PermissionsBitField, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType, Events, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ContextMenuCommandBuilder, SlashCommandBuilder, REST, Routes, GatewayCloseCodes, messageLink, AttachmentBuilder } = require('discord.js');
const config = require("../config.json")
const { Database } = require("st.db")
const mongoose = require("mongoose")
const fs = require("fs")
const path = require('path');
const archiver = require('archiver');
const moment = require('moment-timezone');
const db2 = new Database("/Json-Database/Others/Tokens.json");
const db22 = new Database("/Json-Database/Others/UnusedTokens.json");
const db222 = new Database("/Json-Database/Others/Expired.json");
let backup6 = null
let backup12 = null
/**
 * 
 * @param {Client} client 
 */
module.exports.run = async (client) => {
    try {
        console.log(`\x1b[32mBot\x1b[0m - ${client.user.username} ONLINE`)

        // Mongoose Conection
        mongoose.connect(`${config.mongooseUrl}Super`)
            .then(() => {
                console.log(`\x1b[32mDatabase\x1b[0m - Mongoose ONLINE`)
            })
            .catch((error) => {
                console.log(`\x1b[31mDatabase\x1b[0m - Mongoose Connection error`)
                console.error(error);
            });




        // Bots Subscription
        setInterval(async () => {
            let botsubs = db2.all()
            for (const Types of botsubs) {
                const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                for (const bots of Types.data) {
                    const { ClientID, endTime, Type, PurchasesID, Owner, Token } = bots;
                    if (moment(currentTime).isAfter(endTime)) {
                        const check = db2.get(`Bots`);
                        const Remove = check.filter(re => re.ClientID !== ClientID);
                        await db2.set(`Bots`, Remove).then(() => {
                            db22.push(`TOKENS`, Token).then(() => {
                                db222.set(`Expired_${ClientID}`, true).then(() => {
                                    let botsDatabaseFolder = fs.readdirSync(`./Bot/Json-Database/`)
                                    botsDatabaseFolder.forEach(f => {
                                        let folderPath = path.join('./Bot/Json-Database/', f);
                                        let files = fs.readdirSync(folderPath);
                                        files.forEach(database => {
                                            let botsdatabase = new Database(`./Bot/Json-Database/${f}/${database}`);
                                            let botdb = botsdatabase.all().filter(t => t.ID.includes(ClientID)) || []
                                            botdb.forEach(key => {
                                                botsdatabase.delete(key.ID)
                                            })
                                        })
                                    });
                                })
                            })
                        })
                        let adminlog = client.channels.cache.get(config.Log)
                        if (adminlog) {
                            const embed = new EmbedBuilder()
                                .setColor('Yellow')
                                .setTitle('انتهاء اشتراك')
                                .setDescription(`تم حذف أحد اشتراكات\nBot type : ${Type}\nBot owner : <@!${Owner}>\nClient : <@!${ClientID}>\nPurchasesID : **${PurchasesID}**`)
                                .setTimestamp()
                            adminlog.send({ embeds: [embed] })
                        }
                    }
                }
            }
        }, 5000)
        // Backup System 
        setInterval(() => {
            if (!config.backup.channel) return
            let backupChannel = client.channels.cache.get(config.backup.channel)
            if (!backupChannel) return
            if (!config.backup.pathes.length || config.backup.pathes.length <= 0) return
            if (moment().hours() == 0 || moment().hours() == 12) {
                if (moment().format('YYYY-MM-DD') == backup12) return
                config.backup.pathes.forEach(filePath => {
                    const output_stream = fs.createWriteStream(filePath.path + `-${filePath.name}.zip`);
                    const archive = archiver('zip', {
                        zlib: { level: 9 }
                    });

                    output_stream.on('close', () => {
                        setTimeout(() => {
                            let embed = new EmbedBuilder()
                                .setColor('Green')
                                .setDescription(`${moment().format('YYYY-MM-DD HH:mm:ss')}-${filePath.name}.zip`)
                            backupChannel.send({
                                embeds: [embed],
                                files: [filePath.path + `-${filePath.name}.zip`]
                            }).then(() => {
                                backup12 = moment().format('YYYY-MM-DD')
                            })
                        }, 1500)
                    });

                    archive.pipe(output_stream);
                    archive.glob('**/*', {
                        cwd: filePath.path,
                    }, false);
                    archive.finalize();
                })
            } else if (moment().hours() == 6 || moment().hours() == 18) {
                if (moment().format('YYYY-MM-DD') == backup6) return
                config.backup.pathes.forEach(filePath => {
                    const output_stream = fs.createWriteStream(filePath.path + `-${filePath.name}.zip`);
                    const archive = archiver('zip', {
                        zlib: { level: 9 }
                    });

                    output_stream.on('close', () => {
                        setTimeout(() => {
                            let embed = new EmbedBuilder()
                                .setColor('Green')
                                .setDescription(`${moment().format('YYYY-MM-DD HH:mm:ss')}-${filePath.name}.zip`)
                            backupChannel.send({
                                embeds: [embed],
                                files: [filePath.path + `-${filePath.name}.zip`]
                            }).then(() => {
                                backup6 = moment().format('YYYY-MM-DD')
                            })
                        }, 1500)
                    });

                    archive.pipe(output_stream);
                    archive.glob('**/*', {
                        cwd: filePath.path,
                    }, false);
                    archive.finalize();
                })
            }
        }, 1000 * 60 * 5)
    } catch (error) {
        console.log(error)
    }
};