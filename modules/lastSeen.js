module.exports = {    
    // Create the lastSeen string for the current time
    getLastSeenString()
    {
        const d = new Date( Date.now() );
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} at ${d.getHours() % 12}:${d.getMinutes < 10 ? '0' : ''}${d.getMinutes()} ${d.getHours() > 11 ? 'PM' : 'AM'}` ;
    },
}