module.exports = {
        // Sleep for ms miliseconds
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
}