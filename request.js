const https = require('https');

const get = () => {
    return new Promise((resolve, reject) => {
        https.get('https://ipinfo.io/ip', resp => {
            let data = '';

            resp.on('data', chunk => {
                data += chunk;
            });

            resp.on('end', () => {
                resolve(data);
            });

            })
        .on("error", err => {
            reject (err.message);
        });
    })
}

module.exports = {
    get
}