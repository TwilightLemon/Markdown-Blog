const http = require('http');
const cron=require('node-cron');

function getBingDailyImage() {
    return new Promise((resolve, reject) => {
        http.get('http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let json = JSON.parse(data);
                let url = 'https://www.bing.com' + json.images[0].url;
                let title = json.images[0].copyright;
                resolve({url: url, title: title});
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function setBingImgData() {
    async function update(){
        global.bingImgData = await getBingDailyImage()
        console.log("Bing Image Data Updated");
    }
    await update();
    //update every 5h
    cron.schedule('0 */5 * * *', async () => {
        await update();
    });
}

module.exports.setBingImgData = setBingImgData;