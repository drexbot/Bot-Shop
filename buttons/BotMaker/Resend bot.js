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
} = require("discord.js");

module.exports = {
    name: "resendbot",
    ownerOnly: false,
    run: async (client, interaction, args, config) => {
        try {
            const userid = interaction.customId.split("_")[1].trim()
            let user = interaction.guild.members.cache.get(userid)
            if(!user) return interaction.reply({ content: `لا استطيع ان اجد العضو`, ephemeral: true })
            const invite_Button = new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${interaction.message.components[0].components[0].url}`)
                    .setLabel(`${interaction.message.components[0].components[0].label}`)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${interaction.message.components[0].components[1].url}`)
                    .setLabel(`${interaction.message.components[0].components[1].label}`)
                    .setDisabled(false),
            ]);

            user.send({embeds: [interaction.message.embeds[1]], components: [invite_Button]}).then(() =>{
                return interaction.reply({ content: `تم إرسال الفاتوره بنجاح`, ephemeral: true })
            }).catch(() =>{
                return interaction.reply({ content: `لم استطع إرسال الرساله الي العضو`, ephemeral: true })
            })
        } catch (error) {
            console.log(error)
        }
    }
}