const fs = require('fs');

module.exports = (client) => {
    fs.readdirSync('./buttons').forEach((folder) => {
        const commandFiles = fs.readdirSync(`./buttons/${folder}`).filter(file => file.endsWith('.js'));
        for(file of commandFiles) {
            let commands = require(`../buttons/${folder}/${file}`);
            if(commands.name) {
                client.button.set(commands.name, commands);

            }else{

                continue;
            }
        }
    });
}