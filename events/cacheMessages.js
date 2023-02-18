const { Events } = require('discord.js');


module.exports = {
    name: Events.MessageCreate, 
    async execute(message){
        console.log('worked') ; 
        await message.fetch(); 


    }








}