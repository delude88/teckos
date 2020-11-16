const process = require('process');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const copyfiles = require('copyfiles');

const isWindows = os.platform() === 'win32';
const task = process.argv.slice(2)
		.join(' ');

// eslint-disable-next-line no-console
console.log(`npm-scripts.js [INFO] running task "${task}"`);

const copyFiles = (source, target) => {
		return new Promise((resolve, reject) => {
				console.log("Coping " + source + " to " + target);
				copyfiles([source, target], {
						up: true
				}, (error) => {
						if (error) {
								reject(error);
						}
						resolve();
				});
		});
}
const copyFile = (source, target) => {
		return new Promise((resolve, reject) => {
				fs.copyFile(source, target, (error) => {
						if( error)
								reject(error);
						resolve();
				})
		})
}
const copyExternals = () => {
		return Promise.all([
				copyFiles("./ext/uWebSockets/dist/*.node", "./uWebSockets/"),
				copyFiles("./ext/uWebSockets/docs/index.d.ts", "./uWebSockets/"),
		])
				.then(() => copyFile("./ext/uWebSockets/dist/uws.js", "./uWebSockets/index.js"))
}

switch (task) {

		case 'postinstall': {
				if (!fs.existsSync("./uWebSockets")) {
						if (!isWindows) {
								//execute('make -C ext/uWebSockets');
								copyExternals()
										.then(() => console.log("Copied!"))
						} else {
								execute('nmake -C ext/uWebSockets');
								ncp("ext/uWebSockets", destination, function(err) {
										if (err) {
												return console.error(err);
										}
										console.log('done!');
								});
						}
				}
				break;
		}

		default: {
				throw new TypeError(`unknown task "${task}"`);
		}
}

function execute(command) {
		// eslint-disable-next-line no-console
		console.log(`npm-scripts.js [INFO] executing command: ${command}`);

		try {
				execSync(command, { stdio: ['ignore', process.stdout, process.stderr] });
		} catch (error) {
				process.exit(1);
		}
}
