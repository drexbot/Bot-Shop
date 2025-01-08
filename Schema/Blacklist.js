const mongoose = require('mongoose');

const blacklistData = new mongoose.Schema({
    userid: String,
    reason: String,
    date: String,
    admin: String,
});

const blacklist = mongoose.model('Blacklist', blacklistData);


setInterval(() => {
    switch (mongoose.connection.readyState) {
        case 0:
            break;
        case 1:
            module.exports = blacklist;
            break;
        case 2:
            break;
        case 3:
            break;
        default:
    }
}, 5000);
