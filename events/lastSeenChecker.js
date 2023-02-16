const { Events } = require('discord.js');
const { getLastSeenString } = require('../modules/lastSeen.js');
const { userList } = require('./lastSeenInitializer.js');





module.exports = {
	name: Events.PresenceUpdate,
	execute(oldPresence, newPresence) {
        // If the presence status did not change then do nothing
        if(oldPresence?.status === newPresence.status) return;
        
        // Find the user in local userList with the same id as the presence user
        const user = userList.find(user => user.id === newPresence.member.id);

        // If not offline
        if(newPresence.status !== 'offline') {
            // Set lastSeen to right now
            user.lastSeen = getLastSeenString();
            // Set user to online
            user.online = true;
            
            // For testing purposes if needed
            // console.log(`user: ${newPresence.user.username}#${newPresence.user.discriminator} registered online at ${user.lastSeen}`);
        }
        else {
            // Set lastSeen to right now
            user.lastSeen = getLastSeenString();
            // Set user to offline
            user.online = false;

            // For testing purposes if needed
            // console.log(`user: ${newPresence.user.username}#${newPresence.user.discriminator} went offline at ${user.lastSeen}`)
        }
	},
};