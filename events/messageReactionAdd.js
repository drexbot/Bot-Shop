const config = require("../config.json");
const { Client, Message, PermissionFlagsBits } = require('discord.js')
const { Database } = require("st.db")
let reviewsdb = new Database('/Json-Database/DashBoard/Reviews.json')
/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @returns 
 */
module.exports.run = async (client, message, member) => {
  if (message.message.channelId == config.Rate && message._emoji.name == "🌟") {
    if (config.Developer.includes(member.id)) {
      let ch = client.channels.cache.get(message.message.channelId)
      let rMessage = await ch?.messages?.fetch(message.message.id).catch()
      let MainGuild = client.guilds.cache.get(config.MainGuild)
      let mbr = MainGuild.members.cache.get(message.message.author.id)

      let check = reviewsdb.get('reviews') || []
      if (check.length >= 50) {
        check = check.filter(r => r.messageID != check[49]?.messageID)
        await reviewsdb.set('reviews', check)
      }
      let dubcheck = check.filter(r => r.messageID == message.message.id)[0]
      if (dubcheck) return
      await reviewsdb.push(`reviews`, {
        name: mbr.user.username,
        id: mbr.user.id,
        review: rMessage.content,
        messageID: message.message.id,
      })
    }
  }
}


