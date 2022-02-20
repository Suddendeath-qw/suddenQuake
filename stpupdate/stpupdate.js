import fs from 'fs'
import got from "got"
import AdmZip from "adm-zip"
import checksum from "checksum"
import semver from 'semver'
import prompt from 'prompt'
import readline from "readline"
import c  from "ansi-colors"


class Twirl {
    constructor() {
        this.start = () => {
            this.stop();
            this.intv = (function () {
                var P = ["\\", "|", "/", "-"];
                var x = 0;
                return setInterval(function () {
                    process.stdout.write("\r" + P[x++]);
                    x &= 3;
                }, 250);
            })();
        };

        this.stop = () => {
            if (this.intv)
                clearInterval(this.intv);
        };

        return this;
    }
}

const __pk3name = "suddenteamplay.pk3"
const __cfgname = "__s_teamplay.cfg"
const __ghpk3url = "https://github.com/Suddendeath-qw/suddenQuake/releases/download/latest/suddenteamplay.pk3"
const __rundir = process.cwd();
const tw = new Twirl();

var stp = {
    localVersion: null,
    localChecksum: null,
    githubVersion: null,
    githubChecksum: null,
    update: false
}

c.alias('gd', c.dim.gray)

// INTRO TEXT
console.log();
console.log(c.yellow("      "), c.white("███████ "), c.white("████████╗"), c.white("██████╗ "), c.yellow("      "));
console.log(c.yellow("      "), c.white("██╔════╝"), c.white("╚══██╔══╝"), c.white("██╔══██╗"), c.yellow("      "));
console.log(c.yellow("█████╗"), c.white("███████╗"), c.white("   ██║   "), c.white("██████╔╝"), c.yellow("█████╗"));
console.log(c.yellow("╚════╝"), c.white("╚════██║"), c.white("   ██║   "), c.white("██╔═══╝ "), c.yellow("╚════╝"));
console.log(c.yellow("      "), c.white("███████║"), c.white("   ██║   "), c.white("██║     "), c.yellow("      "));
console.log(c.yellow("      "), c.white("╚══════╝"), c.white("   ╚═╝   "), c.white("╚═╝     "), c.yellow("      "));
console.log(c.bold.yellow("========= SUDDEN TEAMPLAY LITE ========="));
console.log();

// Check local pk3
function checkLocalExist () {
    return new Promise((resolve, reject) => {
        const exist = fs.statSync(__pk3name, {throwIfNoEntry: false}) ? true : false;
        resolve(exist);
    });

}

function checkLocalChecksum () {
    console.log(`Checking local version of ${__pk3name}...`)

    return new Promise((resolve, reject) => {
        console.log("  →", c.gd(`${__pk3name} found in ${__rundir}`))
        checksum.file(__pk3name, (err, hash) => {
            if (err) return reject(err);
            console.log("  →", c.gd(`${__pk3name} checksum: ${hash}`))
            stp.localChecksum = hash;
            resolve();
        });
    });
}

// Check local version
function checkLocalVersion () {
    return new Promise((resolve, reject) => {
        const pk3 = new AdmZip(__pk3name);

        for (const entry of Object.values(pk3.getEntries())) {
            if (entry.entryName !== __cfgname) continue;

            console.log("  →", c.gd(`reading ${entry.entryName}: ${entry.header.size} bytes`));
            const version = entry.getData().toString().match(/set\s\_\.stp\.version\s[\"\']([0-9]\.[0-9]\.[0-9])/);
            if (version == null) return reject(`version number not found in local ${__cfgname}`)
            stp.localVersion = version[1];
            console.log("  →", c.gd(`version ${entry.entryName}: ${stp.localVersion}`));
            resolve();
        }

    });// eof Promise
}

function checkGithub () {
    console.log(`Checking github version of ${__pk3name}...`);

    let ghPk3 = async () => {
        const ghPk3 = await got.get(__ghpk3url);
        const rawBody = ghPk3.rawBody;
        stp.rawBody = rawBody;
        console.log("  →", c.gd(`${__pk3name} at ${__ghpk3url}`))

        const sum = checksum(rawBody)
        console.log("  →", c.gd(`${__pk3name} checksum: ${sum}`))
        stp.githubChecksum = sum;

        const pk3 = new AdmZip(rawBody);
        for (const entry of Object.values(pk3.getEntries())) {
            if (entry.entryName !== __cfgname) continue;

            console.log("  →", c.gd(`reading ${entry.entryName}: ${entry.header.size} bytes`));
            const version = entry.getData().toString().match(/set\s\_\.stp\.version\s[\"\']([0-9]\.[0-9]\.[0-9])/);
            if (version == null) return reject(`version number not found in local ${__cfgname}`)
            stp.githubVersion = version[1];
            console.log("  →", c.gd(`version ${entry.entryName}: ${stp.githubVersion}`));
        }
    }

    return new Promise((resolve, reject) => {
        ghPk3()
        .then(() => {
            resolve();
        })
        .catch(e => {
            reject(e)
        })
    });//eof Promise
}

function compareVersions () {
    console.log(`Comparing versions of ${__pk3name}...`)

    return new Promise((resolve, reject) => {
        let diffChecksum = false

        if (stp.localChecksum === stp.githubChecksum) {
            console.log("  →", c.gd(`your checksum ${stp.localChecksum} matches latest`), c.green("✓"));
            if (semver.eq(stp.localVersion, stp.githubVersion)) {
                console.log("  →", c.gd(`your version ${stp.localVersion} is equal to latest`), c.green("✓"));
            }
        } else {
            diffChecksum = true;
            console.log("  →", c.gd(`your checksum ${stp.localChecksum} does not match latest`), c.red("✗"));
            if (semver.gt(stp.githubVersion, stp.localVersion)) {
                console.log("  →", c.gd(`your version ${stp.localVersion} is older than latest < ${stp.githubVersion}`), c.red("✗"));
            }
        }
            
        resolve();
    });//eof Promise
}

function promptUpdate () {
    return new Promise((resolve, reject) => {
        prompt.start();
        prompt.message = c.yellow(`Do you want to download the latest version of ${__pk3name}? [Y/n]`);
        prompt.delimiter = "";
        prompt.description = " ";
        const schema = {
            properties: {
              update: {
                description: ':',
                pattern: /^[YyNn]+$/,
                message: 'Please answer only Y/n',
                required: true
              }
            }
        };

        prompt.get(schema, (err, result) => {
            if (err) return reject(err);
            return resolve(result.update.toLocaleLowerCase() === "y" ? true : false);
        });
        
    });//eof Promise
}

function downloadLatest () {
    console.log(`Updating ${__pk3name} to latest version ${stp.githubVersion}`);

    return new Promise((resolve, reject) => {
        console.log("  →", c.gd(`writing new ${__pk3name}`))
        fs.writeFileSync(__pk3name, stp.rawBody);

        // Verify checksum
        checksum.file(__pk3name, (err, hash) => {
            if (err) throw new Error(err)
            stp.localChecksum = hash;
            if (stp.localChecksum !== stp.githubChecksum) throw new Error(`download checksum ${stp.localChecksum} does not match github ${stp.githubChecksum}`);
            resolve();
        });
    });
}

function cheers () {
    console.log();
    console.log(c.green(`You have the latest version of ${__pk3name}. SKÅL!`), "🍺🍺");
}

function promptExit () {
    readline
    .createInterface(process.stdin, process.stdout)
    .question("Press [Enter] to exit...", () => process.exit());
}

async function main () {
    // If local pk3 exist, compare local vs. github
    if (await checkLocalExist()) {
        await checkLocalChecksum();
        await checkLocalVersion();
        await checkGithub();
        await compareVersions();
        console.log();

        // If checksums doesn't match, prompt for update
        if (stp.localChecksum !== stp.githubChecksum) {
            console.log(c.redBright(`Your ${__pk3name} is out of date.`));
            if(await promptUpdate()) await downloadLatest();
            else process.exit();
        }
    } else {
        console.log(c.redBright(`${__pk3name} not found in ${__rundir}, you should run this from your qw or configs dir.`));
        if(await promptUpdate()) {
            await checkGithub();
            await downloadLatest();
        }
        else process.exit();
    }
 
    // If checksums match, cheers!
    if (stp.localChecksum === stp.githubChecksum) {
        cheers();
        promptExit();
    }
}

main()
.then(() => {
})
.catch(e => {
    logError(e);
    promptExit();
})

function logError (e) {
    if (typeof e == "string") e = new Error(e);
    console.error(e)
    console.log("🤬", c.bold.red("ERROR:"), c.bold.red(e))
}
