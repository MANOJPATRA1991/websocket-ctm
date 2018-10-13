var express = require('express');

var cors = require('cors');
var router = express.Router();
var bodyParser = require('body-parser');

router.route('/')
.post((req, res) => {
    // fetch('http://18.218.135.95:8000/api/reports/ctm/callback')
    // .then(d => console.log(d));
    res.status(200).json({
        data: req.body
    });
});

module.exports = router;