const mongoose = require('mongoose');

const userCoins = new mongoose.Schema({
    userid: String,
    guild: String,
    coins: Number,
    balance: Number,
});

const balance = mongoose.model('Balance', userCoins);


setInterval(() => {
    switch (mongoose.connection.readyState) {
        case 0:
            break;
        case 1:
            module.exports = balance;
            break;
        case 2:
            break;
        case 3:
            break;
        default:
    }
}, 5000);
