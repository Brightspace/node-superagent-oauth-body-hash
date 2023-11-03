'use strict';

const express = require('express');
const config = require('./config');
const app = express();

app.use(function(req, res, next) {
	res.set('Cache-Control', 'no-cache, no-store');
	next();
});

app.all('/echo', function(req, res) {
	res.writeHead(200, req.headers);
	req.pipe(res);
});

app.listen(config.testPort);
