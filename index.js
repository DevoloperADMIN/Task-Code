const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent, InteractionType } = require('discord.js');
const fs = require('fs');
const DataBase = require('./DataBase');
const Buttons = require('./Buttons');
const Buttons = require('./Buttons');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

const token = 'Token'; // حط التوكن بتاعك
const prefix = '~'; // البريفكس

let tasks = [];

const db = new DataBase(tasks);

client.once('ready', () => {
    console.log(`Say My Name : ${client.user.tag}`)
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'setup') {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Bot Commands')
            .addFields(
                { name: 'Add Task', value: 'اضافه مهمه جديده' },
                { name: 'Listtask', value: 'عرض جميع مهامك', inline: true },
                { name: 'RemindMe', value: 'تذكيرك علي وجود مهمه او شئ اخر', inline: true },
                { name: 'DeleteTask', value: 'لحذف المهمه التي اكملتها', inline: true },
            )
            .setFooter({ text: `DevXor Team` });
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('addtask')
                    .setLabel('Add Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('listtasks')
                    .setLabel('List Tasks')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('remindme')
                    .setLabel('Set Reminder')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('deletetask')
                    .setLabel('Delete Task')
                    .setStyle('DANGER')
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    const buttonsClass = new Buttons({
        client: client,
        db: db,
        interaction: interaction,
        customId: customId
    })

    if (customId === 'addtask') {
        await buttonsClass.addTask();
    }
    else if (customId === 'listtasks') {
        await buttonsClass.tasksList();
    }
    else if (customId === 'remindme') {
        await buttonsClass.remindMe();
    }
    else if (customId === 'deletetask') {
        await buttonsClass.deleteTask();
    }
    else if (customId.startsWith('delete_')) {
       await buttonsClass.deleteTask();
    };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    const { customId } = interaction;

    if (customId === 'addTaskModal') {
        const task = interaction.fields.getTextInputValue('taskInput');
        db.addTask({
            task: task,
            added: new Date()
        });
        await interaction.reply(`Task added: ${task}`);
    } else if (customId === 'remindMeModal') {
        const time = parseInt(interaction.fields.getTextInputValue('timeInput'));
        const reminder = interaction.fields.getTextInputValue('reminderInput');

        if (isNaN(time)) {
            return await interaction.reply('Please specify a valid time in minutes.');
        }

        await interaction.reply(`Reminder set for ${time} minutes: ${reminder}`);
        setTimeout(() => {
            interaction.followUp(`Hello : <@${interaction.user.id}> Your Reminder Now : ${reminder}`);
        }, time * 60000);
    }
});

client.login(token);
