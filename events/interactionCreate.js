const config = require("../config.json");
const { Client, Interaction, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const commandStatusdb = new Database("/Json-Database/Others/CommandStatus.json");
const commandEnabledb = new Database("/Json-Database/Others/EnableChannels.json");

const ownerdb = new Database("/Json-Database/Others/OwnerData.json");
/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports.run = async (client, interaction) => {
  const commandsdb = new Database(`/Json-Database/CommandsData/BotsCommands_${client.user.id}.json`);
  const language = await Botlanguage.get(client.user?.id) || "EN"
  const reply = await messages.get(language)
  const owner = ownerdb.get("Owner_" + client.user.id) || '--'
  let botCommands = commandsdb.get('commands_' + client.user.id) || []
  if (interaction.isCommand()) {
    const { commandName, options, user, guildId } = interaction;
    const command = await client.slashcommands.get(commandName) || await client.Guildcommands.get(commandName)
    if (!command) return;
    botCommands.map(com => {
      if (com.type == command.type && com.slash_commandName == commandName) {
        let commandStatus = commandStatusdb.get(`Status_${client.user.id}_${com.prefix_commandName}`)
        let commandEnabled = commandEnabledb.get(`Enable_${com.prefix_commandName}_${client.user.id}_${interaction.guild.id}`) || []
        if (commandStatus == false) return interaction.reply({ content: `${reply.Others.Reply21}`, ephemeral: true })
        if (commandEnabled.length && !commandEnabled.includes(`${interaction.channel.id}`)) return interaction.reply({ content: `${reply.Others.Reply22.replace("[CHANNEL]", `#${interaction.channel.name}`)}`, ephemeral: true })
        if (config.Owner.includes(interaction.user.id)) {

        } else {
          if (command?.userP?.length) {
            for (const perm of command.userP) {
              const commandP = command.P
              if (!interaction?.member?.permissions.has(perm)) {
                return interaction.reply({ content: reply.Others.Reply18.replace("[PREMS]", commandP), ephemeral: true })
              }
            }
          }

          if (command.ownerOnly === true) {
            if (owner != interaction.user.id)
              return interaction.reply({ content: reply.Owner.Reply6, ephemeral: true, allowedMentions: { repliedUser: false } })
          }
        }


        if (command?.botP?.length) {
          for (const perm of command.botP) {
            const bot = interaction.guild.members.me
            const commandP = command.P
            if (!bot?.permissions.has(perm)) {
              return interaction.reply({ content: reply.Others.Reply17.replace("[PREMS]", commandP), ephemeral: true })
            }
          }
        }


        let embeds;
        embeds = {
          notFoundEmbed: new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", commandName)),

          errorEmbed: new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(reply.Errors.Reply1.replace("[COMMAND]", commandName))
        }

        try {
          if (command) {
            command.run(client, interaction, language, reply, embeds, commandName);
          }
        } catch (error) {
          console.error(`Error executing command ${commandName}:`, error);
        }
      }
    })
  }
  //Buttons Hanlder
  else if (interaction.isButton()) {
    const button = await client.button.get(interaction.customId)
      || client.button.get(interaction.customId.split("_")[0].trim())
      || client.button.get(interaction.customId.split("_")[1].trim())
      || client.button.get(interaction.customId.split("_")[2].trim())
      || client.button.get(interaction.customId.split("_")[3].trim())
      || client.button.get(interaction.customId.split("_")[4].trim())
      || client.button.get(interaction.customId.split("_")[5].trim())
    if (!button) return;

    if (config.Owner.includes(interaction.user.id)) {

    } else {
      if (button?.userP?.length) {
        for (const perm of button.userP) {
          const commandP = button.P
          if (!interaction?.member?.permissions.has(perm)) {
            return interaction.reply({ content: reply.Others.Reply18.replace("[PREMS]", commandP).replace("command", "button"), ephemeral: true })
          }
        }
      }

      if (button.ownerOnly == true) {
        if (owner != interaction.user.id)
          return interaction.reply({ content: reply.Owner.Reply6, ephemeral: true, allowedMentions: { repliedUser: false } })
      }
    }

    let embeds;
    embeds = {
      notFoundEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", interaction?.id)),

      errorEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.Errors.Reply1.replace("[COMMAND]", interaction?.id))
    }
    try {
      if (button) {
        button.run(client, interaction, language, reply, embeds, interaction.customId);
      }
    } catch (error) {
      console.error(`Error executing button ${interaction?.id}:`, error);
    }
  }

  //SelectMenu Handler
  else if (interaction.type === 3) {
    const selectMenu = await client.selectmenu.get(interaction.customId)
      || client.selectmenu.get(interaction.customId.split("_")[0].trim())
      || client.selectmenu.get(interaction.customId.split("_")[1].trim())
      || client.selectmenu.get(interaction.customId.split("_")[2].trim())
      || client.selectmenu.get(interaction.customId.split("_")[3].trim())
      || client.selectmenu.get(interaction.customId.split("_")[4].trim())
      || client.selectmenu.get(interaction.customId.split("_")[5].trim())
    if (!selectMenu) return;

    if (config.Owner.includes(interaction.user.id)) {

    } else {
      if (selectMenu?.userP?.length) {
        for (const perm of selectMenu.userP) {
          const commandP = selectMenu.P
          if (!interaction?.member?.permissions.has(perm)) {
            return interaction.reply({ content: reply.Others.Reply18.replace("[PREMS]", commandP).replace("command", "menu"), ephemeral: true })
          }
        }
      }

      if (selectMenu.ownerOnly === true) {
        if (owner != interaction.user.id)
          return interaction.reply({ content: reply.Owner.Reply6, ephemeral: true, allowedMentions: { repliedUser: false } })
      }
    }


    let embeds;
    embeds = {
      notFoundEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", interaction?.id)),

      errorEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.Errors.Reply1.replace("[COMMAND]", interaction?.id))
    }
    try {
      if (selectMenu) {
        selectMenu.run(client, interaction, language, reply, embeds, interaction.customId);
      }
    } catch (error) {
      console.error(`Error executing select menu ${interaction?.id}:`, error);
    }
  }

  //Modals
  else if (interaction.isModalSubmit()) {
    const modal = await client.modal.get(interaction.customId)
      || client.modal.get(interaction.customId.split("_")[0].trim())
      || client.modal.get(interaction.customId.split("_")[1].trim())
      || client.modal.get(interaction.customId.split("_")[2].trim())
      || client.modal.get(interaction.customId.split("_")[3].trim())
      || client.modal.get(interaction.customId.split("_")[4].trim())
      || client.modal.get(interaction.customId.split("_")[5].trim())
      || client.modal.get(interaction.customId.split("_")[6].trim())
    if (!modal) return;

    if (config.Owner.includes(interaction.user.id)) {

    } else {
      if (modal?.userP?.length) {
        for (const perm of modal.userP) {
          const commandP = modal.P
          if (!interaction?.member?.permissions.has(perm)) {
            return interaction.reply({ content: reply.Others.Reply18.replace("[PREMS]", commandP).replace("command", "modal"), ephemeral: true })
          }
        }
      }

      if (modal.ownerOnly === true) {
        if (owner != interaction.user.id)
          return interaction.reply({ content: reply.Owner.Reply6, ephemeral: true, allowedMentions: { repliedUser: false } })
      }
    }
    let embeds;
    embeds = {
      notFoundEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", interaction?.id)),

      errorEmbed: new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setDescription(reply.Errors.Reply1.replace("[COMMAND]", interaction?.id))
    }

    try {
      if (modal) {
        modal.run(client, interaction, language, reply, embeds, interaction.customId);
      }
    } catch (error) {
      console.error(`Error executing modal ${interaction?.id}:`, error);
    }
  }

}
