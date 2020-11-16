const process = require('process');
const os = require('os');
const { execSync } = require('child_process');

const isWindows = os.platform() === 'win32';

// eslint-disable-next-line no-console
console.log(`npm-scripts.js [INFO] running task "${task}"`);

switch (task) {

		case 'postinstall': {
				if (!isWindows) {
						execute('make -C ext/uWebSockets');
				} else {
						throw new TypeError("Win32 is not supported currently")
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
