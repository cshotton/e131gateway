var express = require('express');
var router = express.Router();

var led = require ("../modules/led");

router.get('/set/:x/:y/:color', (req, res, next) => {

    let x=req.params.x,
        y=req.params.y,
        color=parseInt ("0x" + req.params.color);

    led.xy (x, y, color);
    res.send("0");

});

router.get('/fill/:color', (req, res, next) => {

    let color=parseInt ("0x" + req.params.color);

    led.fill (color);
    res.send("0");

});

router.get('/setdelay/:delay', (req, res, next) => {

    let delay=parseInt (req.params.delay);

    led.setDelay (delay);
    res.send("0");

});

/* 
curl -XPOST -i -H "Content-type: application/json" -d \
'{"frame":[[255,0,0,0,0,0,0,0],[0,255,0,0,0,0,0,0],[0,0,255,0,0,0,0,0],[0,0,0,255,0,0,0,0],[0,0,0,0,255,0,0,0],[0,0,0,0,0,255,0,0],[0,0,0,0,0,0,255,0],[0,0,0,0,0,0,0,255]]}' \
'http://localhost:3000/led/drawframe'
*/
router.post ('/drawframe', (req, res, next) => {
    let frame=req.body;
    led.drawFrame (frame.frame);
    res.send("0");
});

router.get('/getframe', (req, res, next) => {

    let js = led.getFrame ();
    res.send(js);

});

module.exports = router;
