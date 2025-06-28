const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const RSVP_STORAGE = new Map(); // In-memory, replace with file/db if needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Create an event with RSVP options')
    .addStringOption(option =>
      option.setName('name').setDescription('Event name').setRequired(true))
    .addStringOption(option =>
      option.setName('description').setDescription('Event description').setRequired(true))
    .addStringOption(option =>
      option.setName('date').setDescription('Date (e.g. June 30, 2025)').setRequired(true))
    .addStringOption(option =>
      option.setName('time').setDescription('Time (e.g. 5:00 PM EST)').setRequired(true)),

  async execute(interaction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const date = interaction.options.getString('date');
    const time = interaction.options.getString('time');

    const eventId = `${interaction.channel.id}-${Date.now()}`;
    RSVP_STORAGE.set(eventId, { attending: [], maybe: [], declined: [] });

    const embed = new EmbedBuilder()
      .setTitle(`📅 ${name}`)
      .setDescription(description)
      .addFields(
        { name: '📆 Date', value: date, inline: true },
        { name: '⏰ Time', value: time, inline: true },
        { name: '✅ Attending', value: 'No one yet', inline: false }
      )
      .setColor('Blue')
      .setFooter({ text: 'RSVP by clicking a button below!' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`attending_${eventId}`)
        .setLabel('✅ Attend')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`maybe_${eventId}`)
        .setLabel('🤔 Maybe')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`decline_${eventId}`)
        .setLabel('❌ Decline')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
