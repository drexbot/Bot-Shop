const fs = require('fs');

module.exports = (client) => {
    fs.readdirSync('./selectmenu').forEach((folder) => {
        const commandFiles = fs.readdirSync(`./selectmenu/${folder}`).filter(file => file.endsWith('.js'));
        for(file of commandFiles) {
            const dBlue = require('chalk').hex(`#4e44d3`)
            const dRed = require('chalk').hex(`#a90000`)
            let commands = require(`../selectmenu/${folder}/${file}`);
            if(commands.name) {
                client.selectmenu.set(commands.name, commands);

            }else{
                console.log(`ERROR ${file} SELCTMENU`)

                continue;
            }
        }
    });
}