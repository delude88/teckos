const fs = require("fs")
const Axios = require("axios")
const AdmZip = require("adm-zip")

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
    if (!fs.existsSync("./uws")) {
        console.log("Extracting binaries...")
        const zip = new AdmZip("./binaries.zip");
        zip.extractAllTo(".", true);
        fs.renameSync("uWebSockets.js-" + U_WEBSOCKET_VERSION, "uws");
    }
};
/*
const replaceRequire = async () => {
    if( fs.existsSync("./uws/index.d.ts") ) {
        fs.renameSync('./uws/index.d.ts', './uws/uws.d.ts');
        await replace({
            files: './uws/uws.js',
            from: /require/g,
            to: 'import',
        })
        await replace({
            files: './uws/package.json',
            from: /index.d.ts/g,
            to: 'uws.d.ts',
        })
    }
}*/

buildBinaries()
//    .then(() => replaceRequire())

