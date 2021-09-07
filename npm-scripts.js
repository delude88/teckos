const fs = require("fs")
const Axios = require("axios")
const AdmZip = require("adm-zip")
const rimraf = require("rimraf");


const U_WEBSOCKET_VERSION = "19.3.0";

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

const buildBinaries = async () => {
    if (!fs.existsSync("./binaries.zip")) {
        console.log("Downloading binaries...")
        await download("https://github.com/uNetworking/uWebSockets.js/archive/refs/tags/v" + U_WEBSOCKET_VERSION + ".zip", "binaries.zip")
            .catch((error) => {
                fs.rmSync("./binaries.zip");
                console.error(error);
            })
    }
    if(!fs.existsSync("./bin")) {
        const zip = new AdmZip("./binaries.zip");
        zip.extractAllTo(".", true);
        fs.mkdirSync("bin")
        fs.readdirSync("uWebSockets.js-" + U_WEBSOCKET_VERSION)
            .forEach(file => {
                if(file.endsWith("LICENSE") || file.endsWith(".node")) {
                    fs.copyFileSync("uWebSockets.js-" + U_WEBSOCKET_VERSION + "/" + file, "./bin/" + file)
                }
            })
        rimraf.sync("uWebSockets.js-" + U_WEBSOCKET_VERSION)
    }
};

buildBinaries()
