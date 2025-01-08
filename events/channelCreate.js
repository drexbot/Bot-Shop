const config = require("../config.json")
const { Discord, EmbedBuilder } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const logdb = new Database("./Bot/Json-Database/Systems/Log.json");
const protectiondb = new Database("./Bot/Json-Database/Settings/Protection.json")
const moment = require('moment-timezone');

module.exports.run = async (client, channel) => {
  try {
  	const commandsdb = new Database(`/Json-Database/CommandsData/BotsCommands_${client.user.id}.json`);
    const language = await Botlanguage.get(client.user?.id) || "EN"
    const reply = await messages.get(language)
    let log = logdb.get("channel-created_" + channel.guild?.id + "_" + client.user.id) || null
  
    if(log){
      let guild = client.guilds.cache.get(channel.guild.id)
      if(!guild) return
      let logchannel = await channel.guild.channels.cache.get(log.channel) || await channel.guild.channels.fetch(log.channel).catch()
      if(!logchannel) return
      channel.guild.fetchAuditLogs({ action: 10, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        if(info.executor.id == client.user.id) return
        let embed = new EmbedBuilder()
        .setColor( log.color || "Green")
        .setAuthor({ name: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
        .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }),text: info.executor.username})
        .setTimestamp()
        .setTitle(reply.Log.Reply4.replace("[CHANNEL]", channel.name))
        .addFields(
          {name: reply.Log.Field1.name, value: reply.Log.Field1.value.replace("[AUTHOR]", info.executor), inline:true}
        )
        logchannel.send({embeds: [embed]})
      }).catch()
  
    }
    let botCommands = commandsdb.get('commands_' + client.user.id) || []
    const hasProtection = botCommands.some(command => command.type == "Protection");
    if(hasProtection){
      channel.guild.fetchAuditLogs({ action: 10, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        if (info.action == 10 && info.target?.id == channel.id && info.executor) {
          if (info.executor?.id == client.user?.id || info.executor?.id == channel.guild.ownerId) return
          let limit = protectiondb.get("actionLimit_" + "create_channel_" + channel.guild?.id + "_" + client.user.id) || 5
          let automode = protectiondb.get("autoMode_" + "create_channel_" + channel.guild?.id + "_" + client.user.id) || "delete_roles"
          let whitelistCheck = protectiondb.get("whiteList_" + channel.guild?.id + "_" + channel?.id) || []
          let logID = protectiondb.get("protectionLog_" + channel.guild.id + "_" + client.user.id) || null
          if (whitelistCheck && (whitelistCheck.includes("create_channel") || whitelistCheck.includes("all"))) {
            if(logID){
              let log = channel.guild.channels.cache.get(logID)
              if(log){
                let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(channel?.user?.avatarURL({ dynamic: true }))
                .setAuthor({ name: channel?.user?.username, iconURL: channel?.user?.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(reply.Protection.Reply11.replace("[CHANNEL]", channel.name).replace("[ACTION]", "created").replace("[AUTHOR]", info.executor).replace("[TIMES]", reply.Protection.Whitelist.yes))
                log.send({embeds: [embed]})
              }
            }
          }else{
            let userData = protectiondb.get("protectionData_" + "create_channel_" + channel.guild?.id + "_" + info.executor?.id + "_" + client.user.id) || 0
            let timeLeft = limit - userData
    
            if(logID){
              let log = channel.guild.channels.cache.get(logID)
              if(log){
                let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(channel?.user?.avatarURL({ dynamic: true }))
                .setAuthor({ name: channel?.user?.username, iconURL: channel?.user?.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(reply.Protection.Reply11.replace("[CHANNEL]", channel.name).replace("[ACTION]", "created").replace("[AUTHOR]", info.executor).replace("[TIMES]", timeLeft))
                log.send({embeds: [embed]})
              }
            }
            const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            protectiondb.set("protectionData_" + "create_channel_" + channel.guild?.id + "_" + info.executor?.id + "_" + client.user.id, userData + 1).then(() => {
              protectiondb.push(`protectionTimer_${client.user.id}`, {
                ID: info.executor?.id,
                action: 'create_channel',
                Time: endTime,
                server: channel.guild.id,
                Number: userData
              })
            })
            if(userData >= limit){
              let done = false
              if (automode === 'delete_roles') {
                const user = channel.guild.members.cache.get(info.executor?.id)
                if (user) {
                  user.roles.cache.forEach(async r => {
                    await user.roles.remove(r).then(() =>{
                      done = true
                    }).catch(err => { })
                  })
                }
              } else if (automode == 'kick') {
                const user = channel.guild.members.cache.get(info.executor?.id)
                user.kick().then(() =>{
                  done = true
                }).catch(err => { })
              }
              else if (automode == 'ban') {
                const user = channel.guild.members.cache.get(info.executor?.id)
                user.ban().then(() =>{
                  done = true
                }).catch(err => { })
              }
              let serverOwner = channel.guild.members.cache.get(channel.guild.ownerId)
              setTimeout(() =>{
                if(serverOwner && done == true){
                  let embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: reply.Others.Powered })
                  .setTimestamp()
                  .setDescription(reply.Protection.OwnerMSG.Desc.replace("[OWNER]", serverOwner))
                  .addFields(
                    {name: reply.Protection.OwnerMSG.Fileds.Field1.name , value: reply.Protection.OwnerMSG.Fileds.Field1.value.replace("[GUILDNAME]", channel.guild.name)},
                    {name: reply.Protection.OwnerMSG.Fileds.Field2.name , value: reply.Protection.OwnerMSG.Fileds.Field2.value.replace("[USER_MENTION]", info.executor )},
                    {name: reply.Protection.OwnerMSG.Fileds.Field3.name , value: reply.Protection.OwnerMSG.Fileds.Field3.value.replace("[USER_ID]", info.executor?.id)},
                    {name: reply.Protection.OwnerMSG.Fileds.Field4.name , value: reply.Protection.OwnerMSG.Fileds.Field4.value.replace("[ACTION]", "Creating channels")},
                  )
                  serverOwner.send({embeds: [embed]})
                }
              }, 1000)
            }
          }
        }
      }).catch()
    }
  
  } catch (error) {
    
  }
};
