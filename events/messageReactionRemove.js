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
      let check = reviewsdb.get('reviews') || []
      check = check.filter(r => r.messageID != message.message.id)
      await reviewsdb.set('reviews', check)

    }
  }
}


