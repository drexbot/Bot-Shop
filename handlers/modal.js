const fs = require('fs');

module.exports = (client) => {
    fs.readdirSync('./modals').forEach((folder) => {
        const commandFiles = fs.readdirSync(`./modals/${folder}`).filter(file => file.endsWith('.js'));
        for(file of commandFiles) {
            let commands = require(`../modals/${folder}/${file}`);
            if(commands.name) {
                client.modal.set(commands.name, commands);

            }else{

                continue;
            }
        }
    });
}