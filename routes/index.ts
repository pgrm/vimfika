/// <reference path="../typings/tsd.d.ts" />

var express = require( 'express');
var router = express.Router();

// GET home page.
router.get('/', (req, res) => {
  res.render('index', { title: 'VimFika' });
})

router.post('/signup', (req, res) => {
  res.json(req.body);    
})

export = router;