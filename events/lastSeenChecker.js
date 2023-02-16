const { Events } = require('discord.js');
const { getLastSeenString } = require('../modules/lastSeen.js');
const { userList } = require('./lastSeenInitializer.js');





module.exports = {
	name: Events.PresenceUpdate,
	execute(oldPresence, newPresence) {
        if(oldPresence?.status === newPresence.status) return;
        
        const user = userList.find(user => user.id === newPresence.member.id);

        if(newPresence.status !== 'offline') {
            
            user.lastSeen = getLastSeenString();
            user.online = true;
               
            console.log(`user: ${newPresence.user.username}#${newPresence.user.discriminator} registered online at ${user.lastSeen}`);
        }
        else {
            user.lastSeen = getLastSeenString();
            user.online = false;
            console.log(`user: ${newPresence.user.username}#${newPresence.user.discriminator} went offline at ${user.lastSeen}`)
        }
	},
};