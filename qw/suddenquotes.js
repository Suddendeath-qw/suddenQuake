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
       
        // Rand for player
        appendFileSync(cfgFileName, `alias q_${p}_rand "_.rand ${quotes[p].length}; wait; wait; q_${p}$_q_nrand"\n`);
        appendFileSync(cfgFileName, `\n`);
    });

    // Numbered quoutes for rand
    appendFileSync(cfgFileName, `\n\n// numbered quoutes for rnd\n`);
    appendFileSync(cfgFileName, `set _q_count ${allQuotes.length}\n`);
    allQuotes.forEach((q, i) => {
        let alias = `alias _q_${i} "say ${q}"\n`;
        appendFileSync(cfgFileName, alias);
    });

    // rnd alias
    appendFileSync(cfgFileName, `\n\n// rnd q alias\n`);
    appendFileSync(cfgFileName, `set _q_nmax "10000000"\n`);
    appendFileSync(cfgFileName, `alias _.rand "set_calc _q_nrand $rand * %1; _.randround"\n`);
    appendFileSync(cfgFileName, `alias _.randround "set_calc _q_nrand2 $_q_nrand + $_q_nmax; set_calc _q_nrand2 $_q_nrand2 - $_q_nmax; _.randfloor"\n`);
    appendFileSync(cfgFileName, `alias _.randfloor "if ($_q_nrand2 > $_q_nrand) then set_calc _q_nrand $_q_nrand2 - 1 else set _q_nrand $_q_nrand2"\n`);
    appendFileSync(cfgFileName, `alias q_rand "_.rand $_q_count; wait; wait; _q_$_q_nrand"\n`);

    console.log(`Generated ${allQuotes.length} quotes by ${Object.keys(quotes).length} players.`)
} catch (err) {
    console.log(err);
} finally {
    if (fd1 != undefined) closeSync (fd1);
    if (fd2 != undefined) closeSync (fd2);
}
