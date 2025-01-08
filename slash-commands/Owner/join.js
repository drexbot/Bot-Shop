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
    PermissionFlagsBits,
    ChatInputCommandInteraction
} = require("discord.js");
const { Database } = require("st.db");
const userData = new Database("/Json-Database/DashBoard/Auth2Data.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("Let user join the server.")
        .addStringOption(type => type
            .setName("user")
            .setDescription("user id"))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    ownerOnly: true,
        /**
* @param {ChatInputCommandInteraction} interaction
*/
    async run(client, interaction) {
        try {
            const user = interaction.options.getString('user')
            if(user){
                let data = userData.get(user) || null
                if(!data) return interaction.reply({content: `لا استطيع ايجاد هذا الشخص`, ephemeral: true})
                if(!data.access_token) return interaction.reply({content: `لا يمكنني إدخال هذا الشخص`, ephemeral: true})

                const userFetch = await client.users.fetch(data.id).catch(() => { });
                await interaction.guild.members.add(userFetch, { accessToken: data.access_token })
                interaction.reply({content: `تم إدخال العضو`, ephemeral: true})
            }else{
                userData.all().forEach(async data =>{
                    const userFetch = await client.users.fetch(data.data.id).catch(() => { });
                    if(!data.data.access_token || userFetch) return
                    await interaction.guild.members.add(userFetch, { accessToken: data.data.access_token })
                })
                interaction.reply({content: `يتم إدخال الاعضاء الان`, ephemeral: true})
            }
        } catch (error) {
            console.error("Error executing this command:", error);
            await interaction.reply("Error executing this command.");
        }
    },
};

