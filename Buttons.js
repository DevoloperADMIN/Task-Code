const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent, InteractionType } = require('discord.js');
const DataBase = require('./DataBase');

module.exports = class Buttons {
    /**
     * @param {Object} options
     * @param {Client} options.client
     * @param {DataBase} options.db
     * @param {import('discord.js').Interaction} options.interaction
     * @param {String} options.customId
     */
    constructor(options) {
        this.client = options.client;
        this.db = options.db;
        this.interaction = options.interaction;
        this.customId = options.customId;
    };

    async addTask() {
        const modal = new Modal()
            .setCustomId('addTaskModal')
            .setTitle('Add New Task')
            .addComponents(
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('taskInput')
                        .setLabel('Task')
                        .setStyle('PARAGRAPH')
                        .setPlaceholder('Enter Your Task Here')
                        .setRequired(true)
                )
            );

        await this.interaction.showModal(modal);
    };

    async tasksList() {
        if (this.db.length === 0) {
            await this.interaction.reply('No Tasks Available.');
        }
        else {
            const taskList = tasks.map((t, index) => `${index + 1}. ${t.task}`).join('\n');

            const embed = new MessageEmbed()
                .setTitle('Your All Tasks')
                .setDescription(`${taskList}`)
            await this.interaction.reply({ embeds: [embed] })
        }
    };

    async remindMe() {
        const modal = new Modal()
            .setCustomId('remindMeModal')
            .setTitle('Set Reminder')
            .addComponents(
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('timeInput')
                        .setLabel('Time in minutes')
                        .setStyle('SHORT')
                        .setPlaceholder('Enter the time in minutes')
                        .setRequired(true)
                ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('reminderInput')
                        .setLabel('Reminder')
                        .setStyle('PARAGRAPH')
                        .setPlaceholder('Enter Your Reminder Here')
                        .setRequired(true)
                )
            );

        await this.interaction.showModal(modal);
    };

    async deleteTask() {
        if (this.db.length === 0) {
            await this.interaction.reply('No Tasks Available To Delete.');
        } else {
            const rows = [];
            tasks.forEach((task, index) => {
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`delete_${index}`)
                        .setLabel(`Delete Task ${index + 1}`)
                        .setStyle('DANGER')
                );
                rows.push(row);
            });

            await this.interaction.reply({ content: 'Select a Task To Delete:', components: rows });
        }
    };

    async delete() {
        const index = parseInt(this.customId.split('_')[1]);
        if (isNaN(index) || index < 0 || index >= this.db.length) {
            return await this.interaction.reply('Invalid Task Index.');
        }

        const task = this.db.getTaskByIndex(index);
        this.db.removeTaskByIndex(index);

        await this.interaction.reply(`Deleted task: ${task.task}`);
    }
};