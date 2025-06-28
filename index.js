const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
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

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    client.commands.set(command.data.name, command);
  } else {
    client.commands.set(command.name, command);
  }
}

const RSVP_STORAGE = new Map(); // In-memory RSVP store

// Slash command interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, RSVP_STORAGE); // pass RSVP map
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }

  // RSVP Button Handler
  if (interaction.isButton()) {
    const [response, eventId] = interaction.customId.split('_');
    const rsvp = RSVP_STORAGE.get(eventId);
    if (!rsvp) return interaction.reply({ content: '❌ This event is no longer active.', ephemeral: true });

    const userId = interaction.user.id;
    const userTag = interaction.user.tag;

    // Remove user from all categories
    Object.keys(rsvp).forEach(key => {
      rsvp[key] = rsvp[key].filter(tag => tag !== userTag);
    });

    // Add to selected RSVP
    rsvp[response].push(userTag);

    // Update embed
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    embed.spliceFields(2, 1); // remove old RSVP field
    embed.addFields({
      name: '✅ Attending',
      value: rsvp.attending.length ? rsvp.attending.join('\n') : 'No one yet',
      inline: false,
    });

    await interaction.update({ embeds: [embed] });
  }
});

// Legacy prefix command handler
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;
  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  const command = client.commands.get(cmd);
  if (command) command.execute(message, args, client);
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
