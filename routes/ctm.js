var express = require('express');

var cors = require('cors');
var router = express.Router();
var bodyParser = require('body-parser');

router.route('/')
.post((req, res) => {
    console.log(req.body);
    res.status(200).json({
        data: req.body
    });
});

module.exports = router;