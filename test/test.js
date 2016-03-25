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
	const timestamp = 1459883480871;
	const expectedTimestampInSeconds = 1459883480;
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
					`oauth_timestamp="${expectedTimestampInSeconds}"`,
					`oauth_consumer_key="${consumerKey}"`,
					'oauth_signature_method="HMAC-SHA1"',
					'oauth_signature="2J41A2f5jyk5lZQOp8BqBDP3aio%3D"'
				].join(','));
				done();
			});
	});

	it('signs a request and hashes a JSON body', function(done) {
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
					`oauth_timestamp="${expectedTimestampInSeconds}"`,
					`oauth_consumer_key="${consumerKey}"`,
					'oauth_signature_method="HMAC-SHA1"',
					'oauth_body_hash="yAy1RHxuDkxeJiM4JnwtGgUhI6Y%3D"',
					'oauth_signature="TQfU6YuWeof26sbd1MA2uf5DMvo%3D"'
				].join(','));
				done();
			});
	});

	it('signs a request and hashes a string body', function(done) {
		request
			.post(`http://localhost:${config.testPort}/echo?hello=post`)
			.use(oauthBodyHashPlugin)
			.sign({
				consumerKey: consumerKey,
				consumerSecret: 'mySecret'
			})
			.hashBody()
			.send('{\"sensitiveData\":\"My top secret information\"}')
			.end((err, res) => {
				assert(!err);
				assert.equal(res.headers['authorization'], [
					'OAuth oauth_version="1.0"',
					`oauth_nonce="${nonce}"`,
					`oauth_timestamp="${expectedTimestampInSeconds}"`,
					`oauth_consumer_key="${consumerKey}"`,
					'oauth_signature_method="HMAC-SHA1"',
					'oauth_body_hash="yAy1RHxuDkxeJiM4JnwtGgUhI6Y%3D"',
					'oauth_signature="TQfU6YuWeof26sbd1MA2uf5DMvo%3D"'
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
