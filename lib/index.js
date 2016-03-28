'use strict';

const oauthSignature = require('oauth-signature');
const CryptoJS = require('crypto-js');
const sha1 = require('crypto-js/sha1');
const url = require('url');
const uuid = require('uuid');

module.exports = function(request) {
	request.sign = function(creds) {
		this.toSign = true;
		this.consumerKey = creds.consumerKey;
		this.consumerSecret = creds.consumerSecret;
		return this;
	};

	request.hashBody = function() {
		this.toHashBody = true;
		return this;
	};

	request.signOAuth = function() {
		const oauthHeader = {
			oauth_version: '1.0',
			oauth_nonce: uuid.v4(),
			oauth_timestamp: Date.now(),
			oauth_consumer_key: this.consumerKey,
			oauth_signature_method: 'HMAC-SHA1'
		};

		if (this.toHashBody) {
			oauthHeader.oauth_body_hash = sha1(this._data).toString(CryptoJS.enc.Base64);
		}

		const oauthParams = {};
		const queryParams = url.parse(this.url, true).query;
		for (const attrname of Object.keys(queryParams)) {
			oauthParams[attrname] = queryParams[attrname];
		}
		for (const attrname of Object.keys(oauthHeader)) {
			oauthParams[attrname] = oauthHeader[attrname];
		}

		oauthHeader.oauth_signature = oauthSignature.generate(
			this.method,
			this.url,
			oauthParams,
			this.consumerSecret,
			'',
			{
				encodeSignature: false
			});

		const headerArray = [];
		for (const key of Object.keys(oauthHeader)) {
			headerArray.push(`${key}="${encodeURIComponent(oauthHeader[key])}"`);
		}

		this.set('Authorization', `OAuth ${headerArray.join(',')}`);
	};

	const oldEnd = request.end;

	request.end = function() {
		this.end = oldEnd;

		if (this.toSign) {
			this.signOAuth();
		}

		return this.end.apply(this, arguments);
	};
};
