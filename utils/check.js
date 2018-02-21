const request = require('request');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const Check = {};

Check.initialize = function () {
    for (var i = 0; i < accounts.length; i++) {
        login(accounts[i]);
    }
}

function login(account) {
    let email = account.split(':')[0];
    let password = account.split(':')[1];
    let j = request.jar();
    let req = request.defaults({jar: j});
    log(`[${email}] Attempting Login`, 'log');
    let loginHeaders = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US;en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
        'Content-Type': 'text/plain',
        'Host': 'unite.nike.com',
        'Connection': 'keep-alive',
        'Origin': 'https://awr.svs.nike.com/activity/login',
        'Referer': 'https://awr.svs.nike.com/activity/login'
    };

    let loginData = {
        "username": email,
        "password": password,
        "keepMeLoggedIn": true,
        "client_id": "G64vA0b95ZruUtGk1K0FkAgaO3Ch30sj",
        "ux_id": "com.nike.commerce.snkrs.ios",
        "grant_type": "password",
        "contentLocale": "en_US"
    };

    let loginParams = {
        "appVersion": 374,
        "experienceVersion": 317,
        "uxid": "com.nike.commerce.nikedotcom.web",
        "locale": "en_US",
        "backendEnvironment2": "prd",
        "browser": "Google Inc.",
        "os": "undefined",
        "mobile": true,
        "native": true,
        "visit": 1,
        "visitor": uuidv4()
    };

    req(
        {
            url: 'https://unite.nike.com/login',
            qs: loginParams,
            json: loginData,
            headers: loginHeaders,
            gzip: true,
            proxy: formatProxy(proxies[Math.floor(Math.random() * proxies.length)]),
            method: 'post'
        }, function (err, res, body) {
            if (err) {

                log(`[${email}] Request Error Logging In ${err}`, "error");
                setTimeout(login, 1000, account);

            } else if (res.statusCode === 200) {

                // Login Success, passes user ID and access_token to get user info

                let access_token = body.access_token;

                // Determines if login was real or a false positive

                if (body.access_token !== undefined) {

                    log(`[${email}] Logged In`, "debug");

                    getOffers(account, access_token, req);


                } else {

                    setTimeout(login, 1000, account);

                }

            } else if (res.statusCode === 403) {

                log(`[${email}] Proxy Banned On Login`, "error");
                setTimeout(login, 1000, account);

            } else if (!err && body.error_description === 'Your email or password was entered incorrectly.') {

                // Locked account or incorrect login information

                log(`[${email}] Does your brain not function your password is wrong`, "error");

            } else if (res.statusCode === 500 || res.statusCode === 501 || res.statusCode === 502 || res.statusCode === 503 || res.statusCode === 504) {
                log(`[${email}] Login Server Dead`, "error");
                setTimeout(login, 1000, account);
            }
            else {

                log(`[${email}] Unhandled Login Error [ ${res.statusCode} ]`, "error");
                console.log(body);
                setTimeout(login, 1000, account);
            }
        })
}

function getOffers(account, access_token, req) {
    let email = account.split(':')[0];
    let password = account.split(':')[1];
    req(
        {
            url: `https://api.nike.com/launch/exclusive_offers/v2/`,
            method: 'get',
            gzip: true,
            json: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
                "Authorization": `Bearer ${access_token}`
            },
            proxy: formatProxy(proxies[Math.floor(Math.random() * proxies.length)])
        }, function (err, res, body) {
            if (err) {
                log(`[${email}] Request Error Logging In ${err}`, "error");
                setTimeout(getOffers, 1000, account, access_token, req);
            } else if (res.statusCode === 200) {
                if (body.objects.length === 0) {
                    log(`[${email}] No Access`, "error");
                } else {
                    // log(`[${email}] Has Access`, 'success');
                    let product = body.objects[0].productId;
                    getProduct(account, access_token, req, product)
                }
            } else if (res.statusCode === 403) {
                log(`[${email}] Proxy Banned Getting Offers ${task.email}`, "error");
                setTimeout(getOffers, 1000, account, access_token, req);
            } else {
                log(`[${email}] Unhandled Error Getting Offers [ ${res.statusCode} ]`, "error");
                setTimeout(getOffers, 1000, account, access_token, req);
            }
        }
    )
}


function getProduct(account, access_token, req, product) {
    let email = account.split(':')[0];
    let password = account.split(':')[1];
    req(
        {
            url: 'https://api.nike.com/commerce/productfeed/products/v1.5/snkrs/threads?country=US&locale=en_US',
            method: 'get',
            gzip: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
                "Authorization": `Bearer ${access_token}`
            },
            json: true,
            proxy: formatProxy(proxies[Math.floor(Math.random() * proxies.length)])
        }, function (err, res, body) {
            if (err) {
                log(`[${email}] Request Error Logging In ${err}`, "error");
                setTimeout(getProduct, 1000, account, access_token, req, product);
            } else if (res.statusCode === 200) {
                for (let i = 0; i < body.threads.length; i++) {
                    if (body.threads[i].product.id === product) {
                        log(`[${email}] Has Access To: ${body.threads[i].product.fullTitle}` , 'success')
                        accessStream.write(`${email}:${password}\n${body.threads[i].product.fullTitle}`);
                    }
                }
            } else if (res.statusCode === 403) {
                log(`[${email}] Proxy Banned Getting Products ${task.email}`, "error");
                setTimeout(getProduct, 1000, account, access_token, req, product);
            } else {
                log(`[${email}] Unhandled Error Getting Products [ ${res.statusCode} ]`, "error");
                setTimeout(getProduct, 1000, account, access_token, req, product);
            }
        }
    )
}
function formatProxy(proxy) {
    if (proxy && ['localhost', ''].indexOf(proxy) < 0) {
        proxy = proxy.replace(' ', '_');
        const proxySplit = proxy.split(':');
        if (proxySplit.length > 3)
            return "http://" + proxySplit[2] + ":" + proxySplit[3] + "@" + proxySplit[0] + ":" + proxySplit[1];
        else
            return "http://" + proxySplit[0] + ":" + proxySplit[1];
    }
    else
        return undefined;
}

module.exports = Check;
