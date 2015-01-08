import express = require( 'express');
export var router = express.Router();

// GET home page.
router.get('/', (req, res) => {
  res.render('index', { title: 'VimFika' });
})

router.post('/signup', (req, res) => {
  res.json(req.body);    
})