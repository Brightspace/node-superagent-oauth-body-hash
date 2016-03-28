'use strict';

const	assert = require('assert');
const	request = require('superagent');
require('./support/server');
const	config = require('./support/config');
const rewire = require('rewire');
const	oauthBodyHashPlugin = rewire('../lib');
const sinon = require('sinon');

describe('superagent-oauth-body-hash', function() {
	const consumerKey = 'myKey';
	const timestamp = 1448755200;
	const nonce = '89dc817d-3295-42ad-8e8e-db2499331202';
	sinon.useFakeTimers().tick(timestamp);
	oauthBodyHashPlugin.__get__('uuid').v4 = () => nonce;

	it('signs a request without body hash', function(done) {
		request
			.get(`http://localhost:${config.testPort}/echo?hello=get`)
			.use(oauthBodyHashPlugin)
			.sign({
				consumerKey: consumerKey,
				consumerSecret: 'mySecret'
			})
			.end((err, res) => {
				assert(!err);
				assert.equal(res.headers['authorization'], [
					'OAuth oauth_version="1.0"',
					`oauth_nonce="${nonce}"`,
					`oauth_timestamp="${timestamp}"`,
					`oauth_consumer_key="${consumerKey}"`,
					'oauth_signature_method="HMAC-SHA1"',
					'oauth_signature="F6GxGy%2BJBkjPZxrRdOhUgzHH6rU%3D"'
				].join(','));
				done();
			});
	});

	it('signs a request with body hash', function(done) {
		request
			.post(`http://localhost:${config.testPort}/echo?hello=post`)
			.use(oauthBodyHashPlugin)
			.sign({
				consumerKey: consumerKey,
				consumerSecret: 'mySecret'
			})
			.hashBody()
			.send({
				'sensitiveData': 'My top secret information'
			})
			.end((err, res) => {
				assert(!err);
				assert.equal(res.headers['authorization'], [
					'OAuth oauth_version="1.0"',
					`oauth_nonce="${nonce}"`,
					`oauth_timestamp="${timestamp}"`,
					`oauth_consumer_key="${consumerKey}"`,
					'oauth_signature_method="HMAC-SHA1"',
					'oauth_body_hash="mET4HhQI9uy5MhN9M77Xz9z1GKM%3D"',
					'oauth_signature="5VpQ0WxMghpAcA8Z4krWSYMtKHI%3D"'
				].join(','));
				done();
			});
	});

	it('does not break standard superagent behaviour', function(done) {
		request
			.get(`http://localhost:${config.testPort}/echo`)
			.use(oauthBodyHashPlugin)
			.end((err, res) => {
				assert(!err);
				assert(!res.headers['authorization']);
				done();
			});
	});
});
