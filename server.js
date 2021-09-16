const {Client, MessageEmbed , MessageAttachment} = require ("discord.js");
const Discord = require('discord.js');
const client = new Discord.Client();
const Zeew = require("zeew");
const config = require ("./config.json");
const DisTube = require('distube');
require("dotenv").config()


function precense (){
  client.user.setPresence({
    status:"online",
    activity: {
      name: `${config.prefix}report`,
      type: "PLAYING"
    }
  });
}

client.on('ready', () => {
  console.log(`¡Cargado y Preparado!`);
  precense();
});

client.on('message', msg => {
  if (msg.content === 'k!report') {
    msg.reply('Brevemente un Staff se estará comunicando contigo.');
  }
});

client.login(process.env.TOKEN_DS);

client.on('guildMemberAdd', async member => {
  let wel = new Zeew.Bienvenida()
  .token(process.env.TOKEN_ZEEW)
  .estilo("classic")
  .avatar(member.user.displayAvatarURL ({format: 'png'}))
  .fondo("https://i.ibb.co/G5WfL6g/sss.jpg")
  .colorTit("#fff")
  .titulo("¡Bienvenido/a a Goddess Kaisa!")
  .colorDesc("#fff")
  .descripcion("User: " + member.displayName);

  let img = await Zeew.WelcomeZeew(wel);
  let attachment = new MessageAttachment(img, "zeewapi-img.gif");

  client.channels.resolve('698680936677769286').send(attachment);

});

   

// Create a new DisTube
const distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if (command == "p")
        distube.play(message, args.join(" "));

    if (["r", "l"].includes(command))
        distube.setRepeatMode(message, parseInt(args[0]));

    if (command == "s") {
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

    if (command == "sk")
        distube.skip(message);

    if (command == "q") {
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
    
});

// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);

    });
