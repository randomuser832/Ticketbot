const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('./config/config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Load all commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// In-memory RSVP event tracking
const RSVP_STORAGE = new Map();

// Handle message-based commands
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;
  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  const command = client.commands.get(cmd);
  if (command) {
    try {
      await command.execute(message, args, client, RSVP_STORAGE);
    } catch (err) {
      console.error(err);
      message.reply('❌ There was an error executing that command.');
    }
  }
});

// RSVP Button Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const [response, eventId] = interaction.customId.split('_');
  const rsvp = RSVP_STORAGE.get(eventId);
  if (!rsvp) {
    return interaction.reply({ content: '❌ This event is no longer active or RSVP expired.', ephemeral: true });
  }

  const userTag = interaction.user.tag;

  // Remove user from all RSVP categories
  for (const key of Object.keys(rsvp)) {
    const index = rsvp[key].indexOf(userTag);
    if (index !== -1) rsvp[key].splice(index, 1);
  }

  // Add to selected category
  if (!rsvp[response]) rsvp[response] = [];
  rsvp[response].push(userTag);

  // Update embed
  const embed = EmbedBuilder.from(interaction.message.embeds[0]);
  embed.spliceFields(2, 1, {
    name: '✅ Attending',
    value: rsvp.attending.length ? rsvp.attending.join('\n') : 'No one yet',
    inline: false
  });

  await interaction.update({ embeds: [embed] });
});

// On bot ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
