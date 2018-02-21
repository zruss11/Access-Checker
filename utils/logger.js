const chalk = require('chalk');
const moment = require('moment');
module.exports = function log(msg, type) {
    let colors = {
        "error" : chalk.redBright,
        "log" : chalk.white,
        "debug" : chalk.magentaBright,
        "success" : chalk.greenBright
    };

    let types = {
        "error" : "ERR",
        "log" : "LOG",
        "debug" : "DBG",
        "success" : "LOG"
    };


    if (type) {
        console.log(colors[type](`[${moment().format('h:mm:ss.SSS')}] [${types[type]}] ${msg}`));
    } else {
        console.log(`[${moment().format('h:mm:ss.SSS')}] ${msg}`);
    }

};
