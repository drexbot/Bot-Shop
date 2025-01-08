const config = require("../config.json")
const { Discord, EmbedBuilder } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const db = new Database("./Bot/Json-Database/Systems/Log.json");
module.exports.run = async (client, member) => {
  try {
    const language = await Botlanguage.get(client.user?.id) || "EN"
    const reply = await messages.get(language)
    let guild = client.guilds.cache.get(member?.guild?.id)
    if(!guild) return
    //timeout / untimeout
    let log1 = db.get("timeout_" + member.guild?.id + "_" + client.user.id) || null
    if (log1) {
      let channel = await member?.guild?.channels.cache.get(log1.channel) || await member?.guild?.channels.fetch(log1.channel).catch()
      if (!channel) return
      member?.guild?.fetchAuditLogs({ action: 24, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        if (info.action != 24) return
        if (info.changes[0].new) {
          const endTime = new Date(info.changes[0].new);
          const currentTime = new Date();
          const time = ((endTime - currentTime) / 1000) + 30;

          const days = Math.floor(time / (24 * (60 * 60)));
          const hours = Math.floor((time % (24 * (60 * 60))) / (60 * 60));
          const minutes = Math.floor((time % (60 * 60)) / 60);
          if (time - 30 < 5) {
            let embed = new EmbedBuilder()
              .setColor(log1.color || "Green")
              .setThumbnail(member.user.avatarURL({ dynamic: true }))
              .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
              .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
              .setTimestamp()
              .setDescription(reply.Log.Reply3.replace("[USER]", member.user))
            channel.send({ embeds: [embed] })
          } else {
            let wo;
            if (days != 0) wo = days + " day's"
            else if (days == 0 && hours != 0) wo = hours + " hours's"
            else wo = minutes + " minutes"
            let embed = new EmbedBuilder()
              .setColor(log1.color || "Green")
              .setThumbnail(member.user.avatarURL({ dynamic: true }))
              .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
              .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
              .setTimestamp()
              .setDescription(reply.Log.Reply2.replace("[USER]", member.user).replace("[TIME]", wo || ""))
              .addFields(
                { name: reply.Log.Field1.name, value: reply.Log.Field1.value.replace("[AUTHOR]", info.executor), inline: true }
              )
            if (info.reason) {
              embed.addFields(
                { name: reply.Log.Field2.name, value: reply.Log.Field2.value.replace("[REASON]", info.reason), inline: true }
              )
            }
            channel.send({ embeds: [embed] })
          }

        } else if (info.changes[0].old) {
          let embed = new EmbedBuilder()
            .setColor(log1.color || "Green")
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
            .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
            .setTimestamp()
            .setDescription(reply.Log.Reply3.replace("[USER]", member.user))
          channel.send({ embeds: [embed] })
        }
      }).catch()

    }



    let log2 = db.get("role-given_" + member.guild?.id + "_" + client.user.id) || null
    if (log2) {
      let guild = client.guilds.cache.get(member.guild.id)
      if (!guild) return
      let logchannel = await member.guild.channels.cache.get(log2.channel) || await member.guild.channels.fetch(log2.channel).catch()
      if (!logchannel) return
      member.guild.fetchAuditLogs({ action: 25, limit: 1 }).then(async (audit) => {
        let roleName = null
        let roleAction = null
        for (const entry of audit.entries.values()) {
          roleName = entry?.changes[0]?.new[0]?.name
          roleAction = entry?.changes[0]?.key
        }
        if(!roleName || !roleAction) return
        if (roleAction == `$remove`) return
        const info = audit.entries.first();
        let embed = new EmbedBuilder()
          .setColor(log2.color || "Green")
          .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
          .setThumbnail(member.user.avatarURL({ dynamic: true }))
          .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
          .setTimestamp()
          .setDescription(reply.Log.Reply22.replace("[USER]", member))
          .addFields(
            { name: reply.Log.Field5.name, value: reply.Log.Field5.value.replace("[ROLE]", `✅ ` + roleName), inline: true },
            { name: reply.Log.Field1.name, value: reply.Log.Field1.value.replace("[AUTHOR]", info.executor), inline: true },
          )
        logchannel.send({ embeds: [embed] })
      }).catch()

    }


    let log3 = db.get("role-removed_" + member.guild?.id + "_" + client.user.id) || null
    if (log3) {
      let guild = client.guilds.cache.get(member.guild.id)
      if (!guild) return
      let logchannel = await member.guild.channels.cache.get(log3.channel) || await member.guild.channels.fetch(log3.channel).catch()
      if (!logchannel) return
      member.guild.fetchAuditLogs({ action: 25, limit: 1 }).then(async (audit) => {
        let roleName = null
        let roleAction = null
        for (const entry of audit.entries.values()) {
          roleName = entry?.changes[0]?.new[0]?.name
          roleAction = entry?.changes[0]?.key
        }
        if(!roleName || !roleAction) return
        if (roleAction == `$add`) return
        const info = audit.entries.first();
        let embed = new EmbedBuilder()
          .setColor(log3.color || "Green")
          .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
          .setThumbnail(member.user.avatarURL({ dynamic: true }))
          .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
          .setTimestamp()
          .setDescription(reply.Log.Reply22.replace("[USER]", member))
          .addFields(
            { name: reply.Log.Field5.name, value: reply.Log.Field5.value.replace("[ROLE]", `⛔ ` + roleName), inline: true },
            { name: reply.Log.Field1.name, value: reply.Log.Field1.value.replace("[AUTHOR]", info.executor), inline: true },
          )
        logchannel.send({ embeds: [embed] })
      }).catch()

    }
  } catch (error) {
    
  }


};
