const { Events } = require('discord.js');


module.exports = {
    name: Events.MessageCreate, 
    async execute(message){
        await message.fetch(); 
    }   
}