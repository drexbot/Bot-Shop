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
    ChatInputCommandInteraction
} = require("discord.js");


module.exports = {
    name: "substarted",
    ownerOnly: true,
    /**
* 
* @param {ChatInputCommandInteraction} interaction 
*/
    run: async (client, interaction, args, config) => {
        try {
            let ownerId = interaction.customId.split("_")[0]?.trim()
            let botId = interaction.customId.split("_")[1]?.trim()
            let port = interaction.customId.split("_")[2]?.trim()
            let endTime = interaction.customId.split("_")[3]?.trim()
            let owner = interaction.guild.members.cache.get(ownerId)
            if (!owner) return interaction.reply({ content: `لا استطيع ايجاد العضو`, ephemeral: true })

            let embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`
**Thanks for dealing with Super**

__تم الان تفعيل إشتراكك و يمكنك البدأ في أستخدام البوت__

معلومات البوت

ClientId: **(${botId})**
Dashboard Port: **(${port})**
Subscription EndTime: **(${endTime})**`)
            const invite_Button = new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`)
                    .setLabel(`invite`)
                    .setDisabled(false),
            ]);
            owner.send({ embeds: [embed], components: [invite_Button] }).then(() =>{
            interaction.reply({content: `تم إرسال الاشعار`, ephemeral: true})
            }).catch( () => {
              interaction.reply({content: `فشلت في ارسال الاشعار خاص العضو مقفل`, ephemeral: true})
            })
        } catch (error) {
            console.log(error);
        }
    },
};