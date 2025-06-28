const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Lists all available commands',
  async execute(message, args, client) {
    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    const embed = new EmbedBuilder()
      .setTitle('📖 Command List')
      .setColor(0x00AE86)
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    for (const file of commandFiles) {
      const command = require(path.join(commandsDir, file));
      if (command.name && command.description) {
        embed.addFields({ name: `\`${command.name}\``, value: command.description });
      }
    }

    message.channel.send({ embeds: [embed] });
  }
};
