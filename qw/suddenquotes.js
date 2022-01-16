const { openSync, closeSync, appendFileSync } = require('fs');
const quotes = require("./suddenquotes.json");

const fileName = "suddenquotes.cfg";
let fd;

try {
    fd = openSync(fileName, "w")
    let allQuotes = [];

    // Player quotes numbered
    Object.keys(quotes).forEach((p) => {
        appendFileSync(fileName, `// ${p}\n`);
        quotes[p].forEach((q, i) => {
            //console.log(q, i)
            // "say {&c966'Bach... jag kanner igen den gruppen'&r}{ (c) goblin}"
            let quote = `{&c966'${q}'&r} {&cfff(c) ${p}&r}`;
            let alias = `alias q_${p+(i)} "say ${quote}"\n`;
            allQuotes.push(quote);
            appendFileSync(fileName, alias);
        });
       
        // Rand for player
        appendFileSync(fileName, `alias q_${p}_rand "_.rand ${quotes[p].length}; wait; wait; q_${p}$_q_nrand"\n`);
        appendFileSync(fileName, `\n`);
    });

    // Numbered quoutes for rand
    appendFileSync(fileName, `\n\n// numbered quoutes for rnd\n`);
    appendFileSync(fileName, `set _q_count ${allQuotes.length}\n`);
    allQuotes.forEach((q, i) => {
        let alias = `alias _q_${i} "say ${q}"\n`;
        appendFileSync(fileName, alias);
    });

    // rnd alias
    appendFileSync(fileName, `\n\n// rnd q alias\n`);
    appendFileSync(fileName, `set _q_nmax "10000000"\n`);
    appendFileSync(fileName, `alias _.rand "set_calc _q_nrand $rand * %1; _.randround"\n`);
    appendFileSync(fileName, `alias _.randround "set_calc _q_nrand2 $_q_nrand + $_q_nmax; set_calc _q_nrand2 $_q_nrand2 - $_q_nmax; _.randfloor"\n`);
    appendFileSync(fileName, `alias _.randfloor "if ($_q_nrand2 > $_q_nrand) then set_calc _q_nrand $_q_nrand2 - 1 else set _q_nrand $_q_nrand2"\n`);
    appendFileSync(fileName, `alias q_rand "_.rand $_q_count; wait; wait; _q_$_q_nrand"\n`);

    console.log(`Generated ${allQuotes.length} quotes by ${Object.keys(quotes).length} players.`)
} catch (err) {
    console.log(err);
} finally {
    if (fd != undefined) {
        closeSync(fd);
    }
}