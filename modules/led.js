// e131 led functions
var e131 = require('e131');
 
var client = new e131.Client('matrix.local');  // or use a universe
var packet = client.createPacket(64*3);  // we want 8 RGB (x3) slots
var slotsData = packet.getSlotsData();
packet.setSourceName('test E1.31 client');
packet.setUniverse(0x01);  // make universe number consistent with the client
packet.setOption(packet.Options.PREVIEW, true);  // don't really change any fixture
packet.setPriority(packet.DEFAULT_PRIORITY);  // not strictly needed, done automatically
 
// slotsData is a Buffer view, you can use it directly
const col_ct = 8;
const row_ct = 8;

const rotate_cw = true;
const rotate_ccw= false;
const rotate_180= false;
const mirror = false;

var color = 0;
var idx = 0;
var frameDelay = 100; //ms between frame writes

function fy (xx, yy) {
    if (rotate_cw) {
        return xx;
    }

    return yy;
}

function fx (xx, yy) {
    if (rotate_cw) {
        return col_ct - yy - 1;
    }

    return xx;
}

// rainbow-colors, taken from http://goo.gl/Cs3H0v
function ColorWheel(pos) {
    pos = 255 - pos;
    if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
    else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
    else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function int2Rgb (c) {
    return {
        r: (c & 0xff0000) >> 16,
        g: (c & 0xff00) >> 8,
        b: (c & 0xff)
    }
}

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function erase () {
    for (var i = 0; i<slotsData.length; i++) {
        slotsData [i] = 0;
    }
}

function fill (color) {
    let c = int2Rgb (color);
    let ix = 0;
    while (ix<slotsData.length) {
        slotsData [ix++] = c.r;
        slotsData [ix++] = c.g;
        slotsData [ix++] = c.b;
    }
}

function xy (x, y, color) {
    let yy = fy (x,y) * row_ct * 3;
    let xx = fx (x,y) * 3;

    let ix = yy+xx;
//    console.log (`${x}, ${y}, ${color}  - ${xx}, ${yy} = ${ix}`);
    slotsData [ix] = (color >> 16) & 0xff;
    slotsData [ix+1] = (color >> 8) & 0xff;
    slotsData [ix+2] = (color) & 0xff;
}

function getxy (x, y) {
    let yy = fy (x,y) * row_ct * 3;
    let xx = fx (x,y) * 3;

    let ix = yy+xx;
//    console.log (`${x}, ${y}, ${color}  - ${xx}, ${yy} = ${ix}`);
    return (slotsData [ix] << 16) + (slotsData [ix+1] << 8) + slotsData [ix+2];
}

function drawFrame (frame) {
    for (var i=0; i<frame.length; i++) {
        for (var j=0; j<frame[i].length; j++) {
            xy (i, j, frame [i][j]);
        }
    }
}

function getFrame () {
    let res = {frame: []};

    for (var i=0; i<col_ct; i++) {
        res.frame [i] = [];
        for (var j=0; j<row_ct; j++) {
            res.frame [i][j] = getxy (i, j);
        }
    }

    return res;
}

function setDelay (delay) {
    frameDelay = delay;
}

function sender () {
    client.send (packet, function () {
        setTimeout (sender, frameDelay);
    });
}

function chase () {
    slotsData [idx] = 0;
    slotsData [idx+1] = 0;
    idx = (idx+3) % slotsData.length;
    slotsData [idx] = 0xFF;
    slotsData [idx+1] = 0x80;
    client.send(packet, function () {
        setTimeout(chase, 25);
    });
}

let x=0;
let y=0;
let colr = 0;

function chase2 () {
    xy (x,y,0x000000);
    x = (x+1) % col_ct;
    y = (y+1) % row_ct;
    colr = (colr+2) % 256;
    xy (x, y, ColorWheel(colr));

    client.send(packet, function () {
        setTimeout(chase2, 20);
    });
}

function cycleFill () {
    fill (ColorWheel(colr));
    colr = (colr+2) % 256;

    client.send(packet, function () {
        setTimeout(cycleFill, 20);
    });
}

function cycleColor() {
    for (var idx=0; idx<slotsData.length; idx++) {
        slotsData[idx] = color % 0xff;
        color = color + 64;
    }
    client.send(packet, function () {
        setTimeout(cycleColor, 125);
    });
}

erase ();
sender ();

module.exports = {
    xy      : xy,
    erase   : erase,
    fill    : fill,
    drawFrame: drawFrame,
    getFrame: getFrame,
    setDelay: setDelay
}