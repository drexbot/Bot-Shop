const config = require("../config.json")
const { Discord, EmbedBuilder } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("./Bot/messages.json");
const Botlanguage = new Database("/Json-Database/Others/Language.json");
const logdb = new Database("./Bot/Json-Database/Systems/Log.json");
const protectiondb = new Database("./Bot/Json-Database/Settings/Protection.json")

const moment = require('moment-timezone');

module.exports.run = async (client, role) => {
  try {
  const commandsdb = new Database(`/Json-Database/CommandsData/BotsCommands_${client.user.id}.json`);
    const language = await Botlanguage.get(client.user?.id) || "EN"
    const reply = await messages.get(language)
    let log = logdb.get("role-created_" + role.guild?.id + "_" + client.user.id) || null
  
    if(log){
      let guild = client.guilds.cache.get(role.guild.id)
      if(!guild) return
      let logchannel = await role.guild.channels.cache.get(log.channel) || await role.guild.channels.fetch(log.channel).catch()
      if(!logchannel) return
      role.guild.fetchAuditLogs({ action: 30, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        let embed = new EmbedBuilder()
        .setColor( log.color || "Green")
        .setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL({ dynamic: true }) })
        .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }),text: info.executor.username})
        .setTimestamp()
        .setTitle(reply.Log.Reply6.replace("[ROLE]", role.name))
        .addFields(
          {name: reply.Log.Field1.name, value: reply.Log.Field1.value.replace("[AUTHOR]", info.executor), inline:true}
        )
        logchannel.send({embeds: [embed]})
      }).catch()
  
    }
  
  
    let botCommands = commandsdb.get('commands_' + client.user.id) || []
    const hasProtection = botCommands.some(command => command.type == "Protection");
    if(hasProtection){
      role.guild.fetchAuditLogs({ action: 32, limit: 1 }).then(async (audit) => {
        const info = audit.entries.first();
        if (info.action == 32 && info.target?.id == role.user?.id && info.executor) {
          if (info.executor?.id == client.user?.id || info.executor?.id == role.guild.ownerId) return
          let limit = protectiondb.get("actionLimit_" + "create_roles_" + role.guild?.id + "_" + client.user.id) || 5
          let automode = protectiondb.get("autoMode_" + "create_roles_" + role.guild?.id + "_" + client.user.id) || "delete_roles"
          let whitelistCheck = protectiondb.get("whiteList_" + role.guild?.id + "_" + role?.id + "_" + client.user.id) || []
          let logID = protectiondb.get("protectionLog_" + role.guild.id + "_" + client.user.id) || null
          if (whitelistCheck && (whitelistCheck.includes("create_roles") || whitelistCheck.includes("all"))) {
            if(logID){
              let log = role.guild.channels.cache.get(logID)
              if(log){
                let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(role.user.avatarURL({ dynamic: true }))
                .setAuthor({ name: role.user.username, iconURL: role.user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(reply.Protection.Reply12.replace("[ROLE]", role.name).replace("[AUTHOR]", info.executor).replace("[ACTION]", "created").replace("[TIMES]", reply.Protection.Whitelist.yes))
                log.send({embeds: [embed]})
              }
            }
          }else{
            let userData = protectiondb.get("protectionData_" + "create_roles_" + role.guild?.id + "_" + info.executor?.id + "_" + client.user.id) || 0
            let timeLeft = limit - userData
    
            if(logID){
              let log = role.guild.channels.cache.get(logID)
              if(log){
                let embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(role.user.avatarURL({ dynamic: true }))
                .setAuthor({ name: role.user.username, iconURL: role.user.avatarURL({ dynamic: true }) })
                .setFooter({ iconURL: info.executor.avatarURL({ dynamic: true }), text: info.executor.username })
                .setTimestamp()
                .setDescription(reply.Protection.Reply12.replace("[ROLE]", role.name).replace("[AUTHOR]", info.executor).replace("[ACTION]", "created").replace("[TIMES]", timeLeft))
                log.send({embeds: [embed]})
              }
            }
            const endTime = moment().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            protectiondb.set("protectionData_" + "create_roles_" + role.guild?.id + "_" + info.executor?.id + "_" + client.user.id, userData + 1).then(() => {
              protectiondb.push(`protectionTimer_${client.user.id}`, {
                ID: info.executor?.id,
                action: 'create_roles',
                Time: endTime,
                server: role.guild.id,
                Number: userData
              })
            })
            if(userData >= limit){
              let done = false
              if (automode === 'delete_roles') {
                const user = role.guild.members.cache.get(info.executor?.id)
                if (user) {
                  user.roles.cache.forEach(async r => {
                    await user.roles.remove(r).then(() =>{
                      done = true
                    }).catch(err => { })
                  })
                }
              } else if (automode == 'kick') {
                const user = role.guild.members.cache.get(info.executor?.id)
                user.kick().then(() =>{
                  done = true
                }).catch(err => { })
              }
              else if (automode == 'ban') {
                const user = role.guild.members.cache.get(info.executor?.id)
                user.ban().then(() =>{
                  done = true
                }).catch(err => { })
              }
              let serverOwner = role.guild.members.cache.get(role.guild.ownerId)
              setTimeout(() =>{
                if(serverOwner && done == true){
                  let embed = new EmbedBuilder()
                  .setColor("Green")
                  .setFooter({ text: reply.Others.Powered })
                  .setTimestamp()
                  .setDescription(reply.Protection.OwnerMSG.Desc.replace("[OWNER]", serverOwner))
                  .addFields(
                    {name: reply.Protection.OwnerMSG.Fileds.Field1.name , value: reply.Protection.OwnerMSG.Fileds.Field1.value.replace("[GUILDNAME]", role.guild.name)},
                    {name: reply.Protection.OwnerMSG.Fileds.Field2.name , value: reply.Protection.OwnerMSG.Fileds.Field2.value.replace("[USER_MENTION]", info.executor )},
                    {name: reply.Protection.OwnerMSG.Fileds.Field3.name , value: reply.Protection.OwnerMSG.Fileds.Field3.value.replace("[USER_ID]", info.executor?.id)},
                    {name: reply.Protection.OwnerMSG.Fileds.Field4.name , value: reply.Protection.OwnerMSG.Fileds.Field4.value.replace("[ACTION]", "Creating roles")},
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
