const Discord = require('discord.js'); // loads Discord
const colors = require('colors'); // Loads colors
const settings = require('./settings.json') // loads settings
const fs = require('fs')
const enmap = require('Enmap')
const Bot = new Discord.Client(); // Defines Bot as a Discord Client
const prefix = "&"; // Prefix
const ytdl = require('ytdl-core');
Bot.login(settings.token); // Logs Bot into Discord Servers
Bot.xpDB = new enmap({
  name: "Experience Database"
});
Bot.administration = new enmap({
  name: "Administration"
})
Bot.warnings = new enmap({
  name: "Warnings Database"
})
Bot.xpDB.defer.then(() => {
  console.log(colors.yellow("Experience Database has been loaded into memory!"))
})
Bot.administration.defer.then(() => {
  console.log(colors.yellow("Administration Database has been loaded into memory!"))
})
Bot.warnings.defer.then(() => {
  console.log(colors.yellow("Warning Database has been loaded into memory!"))
})
Bot.sayHi = 'oof';
// Event Handler
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    Bot.on(eventName, event.bind(null, Bot));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
  console.log(colors.green(`Loaded ${files.length} events!`))
});
// Command Handler
Bot.commands = new enmap();
Bot.aliases = new enmap();
Bot.permissions = new enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Loaded command: ${commandName} ✓ `);
    Bot.commands.set(props.help.name, props);
    Bot.aliases.set(props.help.alias, props);
    Bot.permissions.set(props.help.name, props.help.permission);
  });
  console.log(colors.green(`Loaded ${files.length} commands!`))
});
Bot.on('message', message => {
  if(message.author.bot) return;
  if(message.guild) {
      let user = message.author.id;
      const key = `${message.guild.id}-${message.author.id}`;

      if(!Bot.xpDB.has(key)) {
        Bot.xpDB.set(key, {
          user: message.author.id,
          guild: message.guild.id,
          points: 0,
          level: 1
        });
      }
      const curLevel = Math.floor(0.1 * Math.sqrt(Bot.xpDB.get(key, "points")));
    // Bot.xpDB is the enmap Database
    if (Bot.xpDB.get(key, "level") < curLevel) {
      message.reply(`You've leveled up to level **${curLevel}**!`);
      Bot.xpDB.set(key, {
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: curLevel
      });
    }
//      console.log(user)

    Bot.xpDB.ensure(key, {
    user: message.author.id,
    guild: message.guild.id,
    points: 0,
    level: 1
  });
  Bot.xpDB.inc(key, "points");
  }
})




process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
