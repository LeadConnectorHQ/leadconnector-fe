import copyFiles from './move_to_wp.js';
import chokidar from 'chokidar';
import { exec } from 'child_process';

// ---------------------------------------------------------------------------
// Set WP_PLUGIN_PATH to the absolute path of your local plugin's trunk folder.
// Example: "/var/www/html/wp-content/plugins/lead-connector/trunk"
// This value is only used on your machine and is never committed.
// ---------------------------------------------------------------------------
const WP_PLUGIN_PATH = '/Users/aman/Local Sites/lead-connector-development/app/public/wp-content/plugins/revex-wordpress-leadconnector-plugin/trunk';

if (!WP_PLUGIN_PATH) {
    console.error(
        "\n[auto_build] ERROR: WP_PLUGIN_PATH is not set.\n" +
        "Open auto_build.js and set the WP_PLUGIN_PATH constant at the top of the file.\n"
    );
    process.exit(1);
}

function runBuild() {
    return new Promise((resolve, reject) => {
        console.log('----  Running New Build ----');

        exec('npm run build-only', (err, stdout) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            console.log(stdout);
            copyFiles(WP_PLUGIN_PATH);
            resolve();
        });
    });
}

if (process.argv.includes('--once')) {
    runBuild()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
} else {
    runBuild();
    chokidar.watch('./src').on('change', () => {
        runBuild();
    });
}
