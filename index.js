global.log = require('./utils/logger');
const fs = require('fs');
const moment            = require('moment');
const proxyInput = fs.readFileSync("proxies.txt").toString().split('\n');
const proxyList = [];
for (var p = 0; p < proxyInput.length; p++) {
    proxyInput[p] = proxyInput[p].replace('\r', '').replace('\n', '');
    if (proxyInput[p] !== '')
        proxyList.push(proxyInput[p]);
}
global.proxies = proxyList;
const accountInput = fs.readFileSync('accounts.txt').toString().split('\n');
const accountList = [];
for (var a = 0; a < accountInput.length; a++) {
    accountInput[a] = accountInput[a].replace('\r', '').replace('\n', '');
    if (accountInput[a] !== '')
        accountList.push(accountInput[a]);
}
global.accounts = accountList;
global.accessStream = fs.createWriteStream(`./logs/${moment().format('lll')}.txt`);
Check = require('./utils/check');

Check.initialize();
