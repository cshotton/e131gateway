let ccxt = require ('ccxt');
var led = require ("./led");

let exchange = new ccxt.binanceus();

const row_ct = 8;
const col_ct = 8;

function _EraseMatrix () {
    led.erase ();
}

function _CalculateGraph (data) {
    let highest = 0;
    let lowest = 999999;
    for (var i=0; i<data.length; i++) {
        if (data[i][1]>highest) {
            highest = data[i][1];
        }
        if (data[i][1]<lowest) {
            lowest = data[i][1];
        }
        if (data[i][4]>highest) {
            highest = data[i][4];
        }
        if (data[i][4]<lowest) {
            lowest = data[i][4];
        }
    }
    let spread = highest-lowest;
    let units = spread / (row_ct-1);
    console.log (`H:${highest}, L:${lowest}, S:${spread}, U:${units}`);

    _EraseMatrix ();

    try {
        for (var col=0; col<col_ct; col++) {
            let sym = ' ';
            let top = 7;
            let bottom = 0;

            if (data[col][1]<=data[col][4]) {
                sym = '+';
                bottom = Math.round ((data[col][1]-lowest) / units);
                top = Math.round ((data[col][4]-lowest) / units);
            }
            else {
                sym = '-';
                bottom = Math.round ((data[col][4]-lowest) / units);
                top = Math.round ((data[col][1]-lowest) / units);
            }

            console.log (`col: ${col}, sym: ${sym}, bottom: ${bottom}, top: ${top}`);
        
            for (var row=bottom; row<=top; row++) {
                led.xy (col,(row_ct-1)-row,sym=='+' ? 0x001000 : 0x100000);
            }
        }
    }
    catch (err) {
        console.log (`Err: ${err}`);
    }
/*
    console.log (">VVVVVVVV");
    for (var row=0; row<row_ct; row++) {
        var line = '>';
        for (var col=0; col<col_ct; col++) {
            line += matrix [(row_ct-1)-row][col];
        }
        console.log (line);
    }
    console.log (">^^^^^^^^");
*/
}

var running = false;

async function _looper () {
//    console.log ("running test 1");
//    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    if (running) {
        setTimeout (_looper, 60000);
    }
    if (exchange.has.fetchOHLCV) {
        var data = await exchange.fetchOHLCV ("BTC/USDT", '1m');
        data = data.slice (data.length-8);
        console.log (data); // one minute
        _CalculateGraph (data);
    }
    else {
        console.log ("doesn't have fetch");
    }
}

function init (runIt) {
    running = runIt;
    if (runIt) {
        _looper();
    }
}

module.exports = {
    init      : init
}
