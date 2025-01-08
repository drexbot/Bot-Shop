const config = require("../config.json")
const { Discord, EmbedBuilder, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const commandStatusdb = new Database("/Json-Database/Others/CommandStatus.json");
const commandEnabledb = new Database("/Json-Database/Others/EnableChannels.json");

const usage = new Database("./Bot/CommandUsage.json")
let autolinedb = new Database("./Bot/Json-Database/Settings/Autoline.json")
let feedbackdb = new Database("./Bot/Json-Database/Settings/Feedback.json")
let taxdb = new Database("./Bot/Json-Database/Settings/Tax.json")
const suggestiondb = new Database("./Bot/Json-Database/Settings/Suggestion.json")
const replydb = new Database("./Bot/Json-Database/Systems/Reply.json")


const ownerdb = new Database("/Json-Database/Others/OwnerData.json");
const prefixdb = new Database("/Json-Database/Others/PrefixData.json");
const aliasesdb = new Database("/Json-Database/Others/Aliases.json");


/**
* @param {Message} message
*/
module.exports.run = async (client, message) => {
  try {
    const commandsdb = new Database(`/Json-Database/CommandsData/BotsCommands_${client.user.id}.json`);
    let botCommands = commandsdb.get('commands_' + client.user.id) || []
    const language = await Botlanguage.get(client.user?.id) || "EN"
    const reply = await messages.get(language)

    if (message.author.bot || !message.guild) return;

    // Autoline system
    if (autolinedb.get("Autoline_" + message.guild?.id + "_" + client.user.id)?.includes(message.channel?.id)) {
      let line = autolinedb.get("Line_" + message.guild?.id + "_" + client.user.id) || null
      if (!line) {
        return message.reply({ content: reply.Autoline.Reply6, allowedMentions: { repliedUser: false } })
      }

      let mode = autolinedb.get(`autolindeMode_${message.guild?.id}_${client.user.id}`) || "file"
      if (mode == "file") {
        message.channel.send({ files: [line] })
      } else if (mode == "message") {
        message.channel.send(`${line}`)
      } else if (mode == "embed") {
        let embed = new EmbedBuilder()
          .setColor(message.guild?.members?.me.displayHexColor)
          .setImage(line)
        message.channel.send({ embeds: [embed] })
      }

    }


    // Feedback system
    if (feedbackdb.get("Feedback_" + message.guild?.id + "_" + client.user.id)?.includes(message.channel?.id)) {
      let line = feedbackdb.get("FeedbackLine_" + message.guild?.id + "_" + client.user.id) || null
      let emoji = feedbackdb.get("FeedbackEmoji_" + message.guild?.id + "_" + client.user.id) || "❤"
      message.react(emoji).catch(() => { })
      if (line) message.channel.send({ files: [line] })
    }

    // Tax system
    if (taxdb.get("Tax_" + message.guild?.id + "_" + client.user.id)?.includes(message.channel?.id)) {
      let args = message.content.split(" ").slice(0).join(" ");

      if (args.endsWith("m")) args = args.replace(/m/gi, "") * 1000000;
      else if (args.endsWith("k")) args = args.replace(/k/gi, "") * 1000;
      else if (args.endsWith("K")) args = args.replace(/K/gi, "") * 1000;
      else if (args.endsWith("M")) args = args.replace(/M/gi, "") * 1000000;
      else if (args.endsWith("b")) args = args.replace(/b/gi, "") * 1000000000;
      else if (args.endsWith("B")) args = args.replace(/B/gi, "") * 1000000000;
      else if (args.endsWith("t")) args = args.replace(/t/gi, "") * 1000000000000;
      else if (args.endsWith("T")) args = args.replace(/T/gi, "") * 1000000000000;

      let args2 = parseInt(args)

      if (isNaN(args2)) {

      } else {

        let tax = Math.floor(args2 * (20) / (19) + (1))
        let probotTaxTakes = tax - args2
        let tax2 = Math.floor(tax * (20) / (19) + (1))
        let tax3 = 0
        let tax4 = Math.floor(tax3 - tax2)

        let buttonData = taxdb.get(`TaxButton_${message.guild.id}_${client.user.id}`) || null


        const button = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId("taxcopy_" + tax)
            .setStyle(ButtonStyle.Primary)
            .setLabel(reply.Tax.Button.copy1)
        ]);
        if (buttonData) {
          let customTax = Math.floor(tax2 + (tax2 * buttonData.tax))
          tax3 = customTax
          tax4 = Math.floor(tax3 - tax2)
          button.addComponents(
            new ButtonBuilder()
              .setCustomId("taxcopy_" + customTax)
              .setStyle(buttonData.color)
              .setLabel(buttonData.name)
          );

        }
        let MessageConetnt = taxdb.get(`TaxMessage_${message.guild.id}_${client.user.id}`) || reply.Tax.Reply7;
        MessageConetnt = MessageConetnt.replace(/\[TAX\]/g, tax)
          .replace(/\[PROBOTTAX\]/g, probotTaxTakes)
          .replace(/\[AMOUNT\]/g, args2)
          .replace(/\[CUSTOMTAX\]/g, tax3)
          .replace(/\[CUSTOMTAKE\]/g, tax4)


        const embed = new EmbedBuilder()
          .setColor(message.member.displayHexColor)
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setDescription(MessageConetnt)


        let line = taxdb.get("TaxLine_" + message.guild?.id + "_" + client.user.id)
        const type = taxdb.get("taxType_" + message.guild?.id + "_" + client.user.id) || 'message'
        if (type === 'embed') {
          message.reply({ embeds: [embed], components: [button] }).then(() => {
            if (line) message.channel.send({ files: [line] })
          })
        } else {
          message.reply({ content: MessageConetnt, components: [button] }).then(() => {
            if (line) message.channel.send({ files: [line] })
          })
        }


      }
    }

    // Suggestion system
    if (suggestiondb.get("Suggestion_" + message.guild?.id + "_" + client.user.id)?.includes(message.channel?.id)) {
      if (message.content.startsWith("https://")) {
        message.delete();
      } else {
        const embed = new EmbedBuilder()
          .setThumbnail(message.author.avatarURL({ dynamic: true }))
          .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
          .setColor("Random")
          .setDescription(`> ${message.content}`)
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
        const attachment = message.attachments.first();
        if (attachment) {
          embed.setImage(attachment.proxyURL);
        }

        message.delete();
        message.channel.send({ embeds: [embed] }).then(async (msg) => {
          const mode = suggestiondb.get(`suggestionMode_${client.user.id}`) || 'react'
          let emojis = suggestiondb.get("emojis_" + message.guild?.id + "_" + client.user.id) || { yes: '✔', no: '❌' }

          if (mode === 'button') {
            const SugButtons = new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setCustomId(`${msg.id}_Yes`)
                .setStyle(ButtonStyle.Success)
                .setEmoji(`${yesemoji}`)
                .setLabel("0")
                .setDisabled(false),
              new ButtonBuilder()
                .setCustomId(`${msg.id}_No`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji(`${noemoji}`)
                .setLabel("0")
                .setDisabled(false),
            ]);

            msg.edit({ components: [SugButtons] }).catch(err => { })
          } else {
            msg.react(`${emojis.yes}`).catch(err => { })
            await msg.react(`${emojis.no}`).catch(err => { })
          }
          const line = suggestiondb.get("SuggestionLine_" + message.guild?.id + "_" + client.user.id)
          if (line) message.channel.send({ files: [line] })
        });
      }
    }

    // Reply system
    if (replydb.get(`Replies_${message.guild.id}_${client.user.id}`)) {
      if (!message.content || message.content.length <= 0) return
      let replyData = replydb.get(`Replies_${message.guild.id}_${client.user.id}`)?.filter(r => message.content.includes(r.word))[0] || null
      if (replyData) {
        let replyType = replyData.reply
        if (replyData.includes == false) {
          if (message.content != replyData.word) return
          if (replyData.role && !message.member.roles.cache.some(r => r.id == replyData.role)) return
          if (replyType == true) {
            message.reply({ content: `${replyData.responses[0]}` }).catch()
          } else {
            message.channel.send({ content: `${replyData.responses[0]}` }).catch()
          }
        } else {
          if (replyData.role && message.member.roles.cache.some(r => r.id == replyData.role)) return
          if (!message.content.includes(replyData.word)) return
            if (replyType == true) {
              message.reply({ content: `${replyData.responses[0]}` }).catch()
            } else {
              message.channel.send({ content: `${replyData.responses[0]}` }).catch()
            }
        }
      }
    }

    const prefix = prefixdb.get("Prefix_" + client.user.id) || '--'
    const owner = ownerdb.get("Owner_" + client.user.id) || '--'

    if (message.content.match(new RegExp(`^<@!?${message.client.user.id}>`))) {
      return message.reply(reply.Others.Reply14.replace("[USER]", message.author).replace("[CLIENT]", client.user).replace("[PREFIX]", prefix));
    }


    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice().trim().split(/ +/g)
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;

    let command = client.commands.get(cmd.slice(prefix.length))
      || client.commands.get(aliasesdb.get(`${cmd}_${client.user.id}`))
    if (!command) return;
    let check = aliasesdb.get(`${cmd}_${client.user.id}`)
    if (!check && !cmd.startsWith(prefix)) return
    botCommands.map(com => {
      if (com.type == command.type && com.prefix_commandName == command.name) {
        let commandStatus = commandStatusdb.get(`Status_${client.user.id}_${com.prefix_commandName}`)
        let commandEnabled = commandEnabledb.get(`Enable_${com.prefix_commandName}_${client.user.id}_${message.guild.id}`) || []
        if (commandStatus == false) return
        if (commandEnabled.length && !commandEnabled.includes(`${message.channel.id}`)) return
        if (command?.botP?.length) {
          for (const perm of command.botP) {
            const bot = message.guild.members.me
            const commandP = command.P
            if (!bot?.permissions.has(perm)) {
              return message.reply({ content: reply.Others.Reply17.replace("[PREMS]", commandP), allowedMentions: { repliedUser: false } })
            }
          }
        }


        if (config.Owner.includes(message.author.id)) {
        } else {
          if (command?.userP?.length) {
            for (const perm of command.userP) {
              const commandP = command.P
              if (!message?.member?.permissions.has(perm)) {
                return message.reply({ content: reply.Others.Reply18.replace("[PREMS]", commandP), allowedMentions: { repliedUser: false } })
              }
            }
          }

          if (command.ownerOnly) {
            if (owner != message.author.id)
              return message.channel.send({ content: reply.Owner.Reply6, allowedMentions: { repliedUser: false } })
          }
        }




        let helpCommand = command.name
        if (command.name == "help" && args[0] && args[0] != "help") helpCommand = args[0]
        let help = usage.get(helpCommand)
        let embeds;
        if (help) {
          embeds = {
            usageEmbed: new EmbedBuilder()
              .setColor("DarkButNotBlack")
              .addFields(
                {
                  name: "**Command: " + helpCommand + "**",
                  value: help.description
                },
                {
                  name: "**Aliases:**",
                  value: help.aliases
                },
                {
                  name: "**Usage:**",
                  value: help.usage
                },
                {
                  name: "**Examples:**",
                  value: help.examples.replaceAll("[author]", message.author).replaceAll("[author.id]", message.author?.id)
                },
              ),

            notFoundEmbed: new EmbedBuilder()
              .setColor("DarkButNotBlack")
              .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", command.name))
          }
        } else {
          if (helpCommand == command.name) {
            embeds = {
              usageEmbed: new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", command.name)),

              notFoundEmbed: new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(reply.NotFound.Reply1.replace("[COMMAND]", command.name))
            }
          } else {
            embeds = null
          }
        }




        if (command) command.run(client, message, args, language, reply, embeds, command.name, botCommands);
      }
    })
  } catch (error) {

  }
};
