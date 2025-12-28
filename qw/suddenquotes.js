const { openSync, closeSync, readFileSync, appendFileSync } = require('fs');
const jsonFileName = "suddenquotes.json";
const cfgFileName = "suddenquotes.cfg";

let fd1, fd2;

try {
    // Read JSON for quotes
    fd1 = openSync(jsonFileName, "r");
    const quotes = JSON.parse(readFileSync(jsonFileName));

    fd2 = openSync(cfgFileName, "w")
    let allQuotes = [];

    // Player quotes numbered
    Object.keys(quotes).forEach((p) => {
        appendFileSync(cfgFileName, `// ${p}\n`);
        quotes[p].forEach((q, i) => {
            let quote = `{&c966'${q}'&r} {&cfff(c) ${p}&r}`;
            let alias = `alias q_${p+(i)} "say ${quote}"\n`;
            allQuotes.push(quote);
            appendFileSync(cfgFileName, alias);
        });
       
        appendFileSync(cfgFileName, `\n`);
    });


    console.log(`Generated ${allQuotes.length} quotes by ${Object.keys(quotes).length} players.`)
} catch (err) {
    console.log(err);
} finally {
    if (fd1 != undefined) closeSync (fd1);
    if (fd2 != undefined) closeSync (fd2);
    
    require('readline')
        .createInterface(process.stdin, process.stdout)
        .question("Press [Enter] to exit...", function(){
            process.exit();
        });
}
