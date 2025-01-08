console.clear()
const { Client, Collection, Discord, createInvite, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ChannelType, ActivityType, WebhookClient, PermissionsBitField, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType, Events, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ContextMenuCommandBuilder, SlashCommandBuilder, REST, Routes, GatewayCloseCodes, messageLink, AttachmentBuilder } = require('discord.js');
const { Database } = require("st.db")
const mongoose = require('mongoose');

const { EventEmitter } = require('events');
const emitter = new EventEmitter();

require('./Bot')
emitter.setMaxListeners(999); 


emitter.on('event', () => {
});
emitter.emit('event');

const moment = require('moment-timezone');
const { token, ClientID, Log, ClientSecret, dashboardIP, SupportSystem } = require('./config.json');
let config = require('./config.json');
const { readdirSync } = require("fs");
const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [
		Partials.Channel,
		Partials.Message,
		Partials.User,
		Partials.GuildMember,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
	]
});
client.login(token);

client.on('err', (error) => {
	console.error('The bot encountered an error:', error);
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (err, origin) => {
	console.error(err)
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.error(err)

});
process.on('warning', (warning) => {
	return;
});

client.on('error', (error) => {
	console.error('An error occurred:', error);
});

client.on('shardError', (error) => {
	console.error('A shard error occurred:', error);
});


client.on(`ready`, async () => {
	client.user.setPresence({
		activities: [
			{
				name: 'Arabs Developers',
				type: ActivityType.Competing,
				url: 'https://www.twitch.tv/Arabs Developers',
			}
		],
		status: "online"
	});

	setInterval(() => {
		client.user.setPresence({
			activities: [
				{
					name: 'Arabs Developers',
					type: ActivityType.Competing,
					url: 'https://www.twitch.tv/ArabsDevelopers',
				}
			],
			status: "online"
		});
	}, 60 * 1000 * 60 * 1)
});

client.on("ready", async () => {
	const rest = new REST({ version: "10" }).setToken(token);
	(async () => {
		try {
			await rest.put(Routes.applicationCommands('1255537872761786378'), {
				body: slashcommands,
			});
		} catch (error) {
			console.error(error);
		}
	})();
});

client.slashcommands = new Collection();
const slashcommands = [];

for (let folder of readdirSync("./slash-commands/").filter(
	(folder) => !folder.includes(".")
)) {
	for (let file of readdirSync("./slash-commands/" + folder).filter((f) =>
		f.endsWith(".js")
	)) {
		let command = require(`./slash-commands/${folder}/${file}`);
		if (command) {
			slashcommands.push(command.data);
			client.slashcommands.set(command.data.name, command);
			if (command.data.name) {

			} else {
				console.log(`/${command.data.name} ERROR`)
			}
		}
	}
}



client.button = new Collection();
require("./handlers/button")(client);

client.selectmenu = new Collection();
require("./handlers/selectmenu")(client);

client.modal = new Collection();
require("./handlers/modal")(client);


client.events = new Collection();
require("./handlers/events")(client);


// Dashbaord //

const fs = require(`fs`);

const DiscordOauth2 = require(`discord-oauth2`);
const cookieParser = require(`cookie-parser`);
const express = require(`express`);
const app = express();
app.enable(`trust proxy`)
app.set(`etag`, false);
app.use(express.static(__dirname + `/website`));
app.set(`views`, __dirname)
app.set(`view engine`, `ejs`)
app.use(cookieParser());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '500kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500kb' }));
const limitter = require("express-rate-limit")
process.oauth = new DiscordOauth2({
	clientId: '1255537872761786378',
	clientSecret: 'dbP85SbzczYpiVqD4VtDb0mdGN_N0yw3',
	redirectUri: `http://node1.roverdev.xyz:27236/callback`
});



module.exports.client = client

app.use((req, res, next) => {
	console.log(`\x1b[90m- ${req.method}: ${req.originalUrl} ${res.statusCode} ( by: ${req.ip} )\x1b[0m`);
	next()
});

for (let folder of readdirSync("./website/public/").filter(
	(folder) => !folder.includes(".")
)) {
	for (let file of readdirSync("./website/public/" + folder).filter((f) =>
		f.endsWith(".js")
	)) {
		let f = require(`./website/public/${folder}/${file}`);
		if (f && f.name && f.type == "get" || f && f.name && !f.type) {
			if (Array.isArray(f.name)) {
				f.name.forEach(name => {
					app.get(name, f.run);
				})
			} else {
				app.get(f.name, f.run);
			}
		} else{
			app.post(f.name, f.run);
		}
	}
}




app.use(function (req, res) {
	res.status(404)
	res.render(`./website/html/EN/404.ejs`)
})
module.exports.app = app


// client.on(`ready`, async () => {
// 	let LocalDatafiles = fs.readdirSync(`./Json-Database/BotsLocalData`).filter(F => F.endsWith(`.json`));
// 	LocalDatafiles.forEach(f => {
// 		let botLocalData = new Database(`./Json-Database/BotsLocalData/${f}`)
// 		botLocalData.deleteAll()
// 		setInterval(() => {
// 			botLocalData.deleteAll();
// 		}, 30 * 60 * 1000);
// 	});
// })


const http = require("http")
const socketIO = require("socket.io")
const server = http.createServer(app)
const io = socketIO(server)

server.listen(27236, () => console.log(`\x1b[32mDashboard\x1b[0m - ${dashboardIP}/`));
io.on(`connection`, (socket) => {
	let user = {}

	let guild = client.guilds.cache.get(SupportSystem.guild)
	if (!guild) return
	socket.on(`ticketMessage`, data => {
		if (guild) {
			let channel = guild.channels.cache.get(user[socket.id])
			if (!channel) return console.log("Cant find chanel", user[socket.id])
			if (channel) {
				let embed = new EmbedBuilder()
					.setColor('Green')
					.setDescription(`${data.message}`)
					.addFields(
						{
							name: `User`,
							value: `${data.userName}`
						},
						{
							name: `ID`,
							value: `${data.userID}`
						},
					)
				if (channel.topic.split("=")[1]?.trim() == "close") return
				channel.send({ embeds: [embed] }).then(() => {
					const date = moment().format('YYYY-MM-DD hh:mm');
					let dataSend = {
						message: data.message,
						userName: data.userName,
						userID: data.userID,
						date: date,
						ticket: user[socket.id],
					}
					io.emit('ticketMessage', dataSend);
				})
			}
		}
	})

	client.on(`messageCreate`, async message => {
		if (!message.author.bot || message.guild.id != guild.id || !message.embeds[0] || client.user.id == message.author.id) return
		const date = moment().format('YYYY-MM-DD hh:mm');
		let dataSend = {
			message: message.embeds[0].data.description,
			userName: message.embeds[0].data.fields[0].value,
			userID: message.embeds[0].data.fields[1].value,
			date: date,
			ticket: user[socket.id],
		}
		io.emit('ticketMessage', dataSend);
	})
	socket.on(`login`, data => {
		user[socket.id] = data.ticketID
	})

	socket.on('disconnect', function () {
		delete user[socket.id]
	})
})


const path = require('path');
const directoryPath = __dirname + '/Schema';
fs.readdir(directoryPath, (err, files) => {
	if (err) {
		console.error(err);
		return;
	}
	files.forEach(file => {
		const filePath = path.join(directoryPath, file);
		if (fs.statSync(filePath).isFile()) {
			try {
				require(filePath);
			} catch (error) {
				console.error(error);
			}
		}
	});
});

const tokens = JSON.parse(fs.readFileSync('tokenschanger.json', 'utf8'));


client.on('messageCreate', async (message) => {
    if (message.content === '!changetokens') {
        let successCount = 0;

        for (const token of tokens) {
            const botClient = new Client({ intents: 32767 });
            botClient.login(token).then(async () => {
                try {
                    await botClient.user.setUsername('Powered By Arabs'); // غير اسم البوت هنا
                    await botClient.user.setAvatar('https://media.discordapp.net/attachments/1251184113155706961/1260227666309545986/images__3_-removebg-preview.png?ex=668e8df9&is=668d3c79&hm=6a479f7ce6d6f99550d96ca438dd0113a98ee18b865dc5ee7aeb216c2f02ab0c&'); // غير رابط الصورة هنا
                    console.log(`Successfully changed name and avatar for bot: ${botClient.user.tag}`);
                    successCount++;
                    botClient.destroy();
                } catch (error) {
                    console.error(`Failed to change name or avatar for bot with token: ${token}`, error);
                    botClient.destroy();
                }
            }).catch(error => {
                console.error(`Failed to login with token: ${token}`, error);
            });
        }

        // انتظر قليلاً للتأكد من اكتمال جميع العمليات
        setTimeout(() => {
            message.channel.send(`Done Change ${successCount} bot(s) Name And Pic`);
        }, 10000); // يمكن تعديل هذه المدة بناءً على عدد البوتات والوقت المتوقع لإتمام التغييرات
    }
});