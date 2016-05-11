# node-superagent-oauth-body-hash

A superagent plugin to sign requests using OAuth 1.0 (http://tools.ietf.org/html/rfc5849) with an option to include
a so-called “body hash” as defined in "OAuth Request Body Hash" (https://oauth.googlecode.com/svn/spec/ext/body_hash/1.0/oauth-bodyhash.html).

## Usage

```javascript
const request = require('superagent');
const oauthBodyHashPlugin = require('node-superagent-oauth-body-hash');

request
	.post('http://localhost:8090/echo?hello=post')
	.use(oauthBodyHashPlugin)
	.sign({
		consumerKey: 'myKey',
		consumerSecret: 'mySecret'
	})
	.hashBody() // can come before .sign(), the order doesn't matter
	.send({
		'sensitiveData': 'My top secret information'
	})
	.end((err, res) => {
		/* the outgoing req.headers['authorization'] looks as follows:
		OAuth oauth_version="1.0",
			oauth_nonce="89dc817d-3295-42ad-8e8e-db2499331202",
			oauth_timestamp="1448755200",
			oauth_consumer_key="myKey",
			oauth_signature_method="HMAC-SHA1",
			oauth_body_hash="yAy1RHxuDkxeJiM4JnwtGgUhI6Y%3D",
			oauth_signature="fmV8ijMWVYV8gdaz3XNd9jqtvpA%253D"
		*/
	});
```

### Notes
1. Always use HTTPS
2. The module supports only a subset of OAuth (consumer only)
3. Check out the standards for any limitations/restrictions
4. The plugin stringifies the JSON body before hashing it

### Versioning

node-superagent-oauth-body-hash is maintained under the [Semantic Versioning guidelines](http://semver.org/).

## License
Copyright 2016 D2L Corporation.

Licensed under the Apache License, Version 2.0.

See [LICENSE](https://github.com/Brightspace/lti-outcomes-halfpi-tp/blob/master/LICENSE) for further details.
