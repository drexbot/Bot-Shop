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
let commandsdb = new Database('/commands.json')
let botbuildingdb = new Database('/Json-Database/Others/Building.json')
let config = require("../../config.json")
module.exports = {
    name: "Botmaker_Selector",
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
            const Selected = interaction.values[0];
            if (Selected == "buybots_Selected") {
                const dropMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("buybot-Selector")
                        .setPlaceholder("Select your bot from here.!")
                        .setOptions([
                            {
                                label: "Autoline",
                                value: "Autoline_Selected",
                                description: "بوت خط تلقائي",
                            },
                            {
                                label: "Suggestion",
                                value: "Suggestion_Selected",
                                description: "بوت اقترحات",
                            },
                            {
                                label: "Probot tax",
                                value: "Tax_Selected",
                                description: "بوت ضريبه",
                            },
                            {
                                label: "System",
                                value: "System_Selected",
                                description: "بوت سيستم اوامر اداريه",
                            },
                            {
                                label: "Ticket",
                                value: "Ticket_Selected",
                                description: "بوت تكت مطور",
                            },
                            {
                                label: "Giveaway",
                                value: "Giveaway_Selected",
                                description: "بوت قيف اواي ازرار",
                            },
                            {
                                label: "Feedback",
                                value: "Feedback_Selected",
                                description: "بوت اراء",
                            },
                            {
                                label: "Protection",
                                value: "Protection_Selected",
                                description: "بوت حمايه",
                            },
                            {
                                label: "Apply",
                                value: "Apply_Selected",
                                description: "بوت تقديمات",
                            },
                            {
                                label: "Log",
                                value: "Log_Selected",
                                description: "بوت لوقات",
                            },

                            {
                                label: "Selfrole",
                                value: "Selfrole_Selected",
                                description: "بوت اثبت نفسك او جمع رتب",
                            },
                           {
                                label: "Package Bot",
                                value: "Package_Selected",
                                description: "بوت فيه جميع البوتات",
                            }
                        ])
                );

                interaction.reply({ components: [dropMenu], ephemeral: true }).then(async (msg) => {
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter: (i) => i.user.id === interaction.user.id,
                        time: 30000,
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
            } else if (Selected == "buildbot_Selected") {
                let commands = commandsdb.all().filter(data => data.ID.includes('command') && data.data.name);
                botbuildingdb.delete(`buildBot_${interaction.user.id}`)
                let options = [];
                let menus = [];
                let chunkSize = 25;

                for (let i = 0; i < commands.length; i += chunkSize) {
                    let chunk = commands.slice(i, i + chunkSize);

                    chunk.forEach(com => {
                        options.push({
                            label: `${com.data.name}`,
                            value: `${com.data.type}_${com.ID}_${com.data.price || 0}`,
                            description: `${com.data.description}` || "No description for this command",
                        });
                    });

                    const dropMenu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(i + "_" + "builtbot-Selector")
                            .setPlaceholder("Select your bot commands from here.!")
                            .setOptions([...options])
                    );

                    menus.push(dropMenu);
                    options = [];
                }

                interaction.reply({ components: menus, ephemeral: true }).then(async (msg) => {
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter: (i) => i.user.id === interaction.user.id,
                        time: 300000,
                    });
                    collector.on("collect", async (i) => {
                        try {
                            if (i.customId.split("_")[1]?.trim() == "builtbot-Selector") {
                                const Selected = i.values[0]
                                let type = Selected.split("_")[0]?.trim()
                                let commandID = Selected.split("_")[1]?.trim()
                                let price = Selected.split("_")[2]?.trim()
                                let command = commandsdb.get(commandID)
                                let commandsEmbed = i.message.embeds[0]
    
                                let check = botbuildingdb.get(`buildBot_${interaction.user.id}`) || []
                                if (!check.includes(commandID)) botbuildingdb.push(`buildBot_${interaction.user.id}`, commandID)
    
                                let commands = commandsdb.all().filter(data => data.ID.includes('command') && data.data.name && !check.includes(data.ID));
    
                                let options = [];
                                let menus = [];
                                let chunkSize = 25;
                                for (let i = 0; i < commands.length; i += chunkSize) {
                                    let chunk = commands.slice(i, i + chunkSize);
    
                                    chunk.forEach(com => {
                                        options.push({
                                            label: `${com.data.name}`,
                                            value: `${com.data.type}_${com.ID}_${com.data.price || 0}`,
                                            description: `${com.data.description}` || "No description for this command",
                                        });
                                    });
                                    options.forEach((op) =>{
                                        if(op.value.split("_")[1]?.trim() == commandID){
                                            options = options.filter(p => p.value != op.value)
                                        }
                                    })

                                    if(options.length > 0){
                                        const dropMenu = new ActionRowBuilder().addComponents(
                                            new StringSelectMenuBuilder()
                                                .setCustomId(i + "_" + "builtbot-Selector")
                                                .setPlaceholder("Select your bot commands from here.!")
                                                .setOptions([...options])
                                        );
                                        menus.push(dropMenu);
                                    }
                                    options = [];
                                }
    
    
                                i.deferUpdate().catch(() => {collector.stop()});
                                if (!commandsEmbed) {
                                    let embed = new EmbedBuilder()
                                        .setColor("DarkButNotBlack")
                                        .setTitle("Commands Selected")
                                        .setDescription(`> **Type: ${type}** | **Name: ${command.name}** | **Price: ${price}**`)
                                        .addFields({ name: ' ', value: `Total: **${price}**` })
                                    msg.edit({ embeds: [embed], components: menus, ephemeral: true }).catch(() =>{
                                        collector.stop()
                                    })
                                } else {
                                    let check = botbuildingdb.get(`buildBot_${interaction.user.id}`) || []
                                    let botTypes = commandsdb.all().filter(data => !data.ID.includes('command') && !data.ID.includes('config')).map(data => data.ID)
                                    let locked = false
                                    botTypes.forEach((bot) => {
                                        let bots = commandsdb.get(bot)
                                        if (check.length + 1 != bots.length) {
    
                                        } else {
                                            check.sort();
                                            bots.sort();
    
                                            let arraysMatch = check.every((value, index) => value === bots[index]);
                                            if (arraysMatch) {
                                                locked = true
                                            } else {
    
                                            }
                                        }
                                    })
    
                                    const button = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                        .setCustomId("cancel_purchase")
                                        .setStyle(ButtonStyle.Danger)
                                        .setLabel("إلغاء"),
                                        new ButtonBuilder()
                                            .setCustomId(`Custom_continue`)
                                            .setStyle(ButtonStyle.Success)
                                            .setDisabled(locked)
                                            .setLabel("بناء البوت"),
                                    );
    
                                    menus.push(button)
    
                                    let embed = new EmbedBuilder()
                                    .setColor("DarkButNotBlack")
                                    .setTitle("Commands Selected")
                                    .setDescription(`${i.message.embeds[0].description}\n> **Type: ${type}** | **Name: ${command.name}** | **Price: ${price}**`)
                                    .addFields({ name: ' ', value: `Total: **${parseInt(i.message.embeds[0].fields[0].value.match(/\*\*(.*?)\*\*/)[1]) + parseInt(price)}**` })
    
    
                                    msg.edit({ embeds: [embed], components: menus, ephemeral: true }).catch(() =>{
                                        collector.stop()
                                    })
                                }
                            }else{
                                msg.delete().catch(error => { })
                            }
                        } catch (error) {
                            
                        }
                    });
                    collector.on("end", (collected) => {
                        if (collected.size === 0) {
                            if (msg) {
                                msg.delete().catch(error => { })
                            }
                        }
                    });
                })

            }

            else {
                interaction.reply({ content: 'I cant find this selection' })
            }

            setTimeout(() => {
                interaction.message.edit({ components: [interaction.message.components[0]] })
            }, 1500)
        } catch (error) {
            console.log(error)
        }
    }
}
