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
    name: "aliases-selector",
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
            let action = interaction.customId.split("_")[1]?.trim()
            let command = Selected.split("_")[0]?.trim()
            let id = Selected.split("_")[1]?.trim()


            const modal = new ModalBuilder()
			.setCustomId(`${command}_${id}_${action}_modal-aliases`)
			.setTitle(`${action} ${command} aliases`);
            const aliase = new TextInputBuilder()
			.setCustomId('aliase')
            .setRequired(true)
			.setLabel(`Type the aliase to ${action}`)
            .setPlaceholder(`command: ${command}`)
			.setStyle(TextInputStyle.Short);

            
            const the_aliase = new ActionRowBuilder().addComponents(aliase);
            modal.addComponents(the_aliase);
            await interaction.showModal(modal);
        } catch (error) {
            console.log(error)
        }
    }
}