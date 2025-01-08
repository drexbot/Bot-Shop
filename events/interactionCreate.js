const config = require("../config.json");
const { Client, Interaction, PermissionFlagsBits } = require('discord.js')
/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports.run = async (client, interaction) => {
  if (interaction.isCommand()) {
    const { commandName, options, user, guildId } = interaction;

    const command = await client.slashcommands.get(commandName) || await client.Guildcommands.get(commandName)
    if (!command) return;
    if (command.ownerOnly === true) {
      if (!config.Owner.includes(interaction.user.id)) {
        return interaction.reply({ content: `[!] *لا تستطيع استخدام هذا الامر*`, ephemeral: true });
      }
    }

    if (!config.commandChannel.includes(interaction.channel.id) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: `استعمل االاوامر في روم الاوامر <#1233799109253795951>`, ephemeral: true })
    }

    try {
      if (command) {
        command.run(client, interaction);
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
    }
  }
  //Buttons Hanlder
  else if (interaction.isButton()) {
    const button = await client.button.get(interaction.customId)
    || client.button.get(interaction.customId.split("_")[0]?.trim())
    || client.button.get(interaction.customId.split("_")[1]?.trim())
    || client.button.get(interaction.customId.split("_")[2]?.trim())
    || client.button.get(interaction.customId.split("_")[3]?.trim())
    || client.button.get(interaction.customId.split("_")[4]?.trim())
    || client.button.get(interaction.customId.split("_")[5]?.trim())

    if (!button) return;
    if (button.ownerOnly === true) {
      if (!config.Owner.includes(interaction.user.id)) {
        return interaction.reply({ content: `[!] *لا تمتلك صلاحيه لاستخدام هذا الزر*`, ephemeral: true });
      }
    }
    try {
      if (button) {
        button.run(client, interaction);
      }
    } catch (error) {
      console.error(`Error executing button ${customId}:`, error);
    }
  }

  //SelectMenu Handler
  else if (interaction.type === 3) {

    const selectMenu = await client.selectmenu.get(interaction.customId)
      || client.selectmenu.get(interaction.customId.split("_")[0]?.trim())
      || client.selectmenu.get(interaction.customId.split("_")[1]?.trim())
      || client.selectmenu.get(interaction.customId.split("_")[2]?.trim())
      || client.selectmenu.get(interaction.customId.split("_")[3]?.trim())
      || client.selectmenu.get(interaction.customId.split("_")[4]?.trim())
      || client.selectmenu.get(interaction.customId.split("_")[5]?.trim())
    if (!selectMenu) return;
    if (selectMenu.ownerOnly === true) {
      if (!config.Owner.includes(interaction.user.id)) {
        return interaction.reply({ content: `[!] *لا تستطيع استخدام هذا القائمة*`, ephemeral: true });
      }
    }
    try {
      if (selectMenu) {
        selectMenu.run(client, interaction);
      }
    } catch (error) {
      console.error(`Error executing select menu ${customId}:`, error);
    }
  }

  //Modals
  else if (interaction.isModalSubmit()) {
    const modal = await client.modal.get(interaction.customId)
      || client.modal.get(interaction.customId.split("_")[0]?.trim())
      || client.modal.get(interaction.customId.split("_")[1]?.trim())
      || client.modal.get(interaction.customId.split("_")[2]?.trim())
      || client.modal.get(interaction.customId.split("_")[3]?.trim())
      || client.modal.get(interaction.customId.split("_")[4]?.trim())
      || client.modal.get(interaction.customId.split("_")[5]?.trim())
    if (!modal) return;

    if (modal.ownerOnly === true) {
      if (!config.Owner.includes(interaction.user.id)) {
        return interaction.reply({ content: `[!] *لا تستطيع استخدام هذا النموذج*`, ephemeral: true });
      }
    }
    try {
      if (modal) {
        modal.run(client, interaction);
      }
    } catch (error) {
      console.error(`Error executing select menu ${customId}:`, error);
    }
  }

}
