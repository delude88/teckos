import fs from "fs";
import rimraf from "rimraf";
import AdmZip from "adm-zip";
import Axios from "axios";

const U_WEBSOCKET_VERSION = "20.10.0";

const download = async (url, dest) => {
    const writer = fs.createWriteStream(dest)
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
};

const downloadUWS = async () => {
    const hasNoBinaries = !fs.existsSync("./uws") || !fs.readdirSync('./uws').find(file => file.endsWith(".node"))
    if (hasNoBinaries) {
        try {
            console.log("Downloading node binaries...")
            await download(`https://github.com/uNetworking/uWebSockets.js/archive/refs/tags/v${U_WEBSOCKET_VERSION}.zip`, `./binaries-${U_WEBSOCKET_VERSION}.zip`)
            console.log("Extracting node binaries...")
            const zip = new AdmZip(`./binaries-${U_WEBSOCKET_VERSION}.zip`)
            zip.extractAllTo(".", true)
            fs.readdirSync(`./uWebSockets.js-${U_WEBSOCKET_VERSION}`)
                .forEach(file => {
                    if (file.endsWith(".node")) {
                        fs.renameSync("./uWebSockets.js-" + U_WEBSOCKET_VERSION + "/" + file, "./uws/" + file)
                    }
                })
            rimraf.sync(`./uWebSockets.js-${U_WEBSOCKET_VERSION}`)
            rimraf.sync(`./binaries-${U_WEBSOCKET_VERSION}.zip`)
        } catch (err) {
            console.error(err)
            rimraf.sync(`./binaries-${U_WEBSOCKET_VERSION}.zip`)
            rimraf.sync(`./uWebSockets.js-${U_WEBSOCKET_VERSION}`)
        }
    }
};

downloadUWS()
