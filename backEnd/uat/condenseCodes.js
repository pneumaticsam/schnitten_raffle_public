fs = require('fs');

let rawdata = fs.readFileSync(`../../raffle-docs/raffle-codes.csv`).toString();
let darray = rawdata.split(',\n');
let data = [];
let kounter = 0,
    limit = 5;
darray.forEach(e => {
    if (e.substr(16, 5) == "'0'") {
        kounter++;
    } else {
        console.log(`${kounter}: "${e.substr(16, 5)}"`);
        kounter = 0;
        //return;
    }
    if (kounter < limit) {
        data.push(e.substr(1, 12));
    }
    //return;
});

fs.writeFileSync('./condensedCodes.js', data.join(',\n'));
//'5E9CPMWY6DB9', '0',