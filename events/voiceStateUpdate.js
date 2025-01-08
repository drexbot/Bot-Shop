const config = require("../config.json")
const { Discord, EmbedBuilder } = require('discord.js')
const { Database } = require("st.db")
const messages = new Database("/messages.json");
const Botlanguage = new Database("./Bot/Json-Database/Others/Language.json");
const db = new Database("./Bot/Json-Database/Systems/Log.json");
module.exports.run = async (client, oldState, newState) => {
    try {
        const language = await Botlanguage.get(client.user?.id) || "EN"
        const reply = await messages.get(language)
        //   !oldState.channel && newState.channel = joined
        // oldState.channel && !newState.channel = left
    
        let log1 = db.get("member-disconnected_" + oldState.guild?.id + "_" + client.user.id) || null
        if(log1){
            let guild = client.guilds.cache.get(oldState.guild.id)
            if(!guild) return
            let channel = await oldState.guild.channels.cache.get(log1.channel) || await oldState.guild.channels.fetch(log1.channel).catch()
            if(!channel) return
            let embed = new EmbedBuilder()
            .setColor( log1.color || "Green")
            .setAuthor({ name: oldState.guild.name, iconURL: oldState.guild.iconURL({ dynamic: true }) })
            .setFooter({ iconURL: oldState.guild.iconURL({ dynamic: true }), text: oldState.guild.name})
            .setTimestamp()
            .setDescription(reply.Log.Reply13.replace("[USER]", "<@!" + oldState?.id + ">").replace("[CHANNEL]", oldState.channel.name))
            channel.send({embeds: [embed]})
        }
    } catch (error) {
        
    }
};
