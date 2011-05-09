/**
 * @include "Result.js"
 * @include "util.js"
 */

(function($) {
	QQApi = {
		update : function(msg, tokenObj, callback) {
			log('qq update...');

			var accessor = {
				consumerSecret : consumer_secret,
				tokenSecret : tokenObj.oauth_token_secret
			};

			var para = {
				oauth_consumer_key : consumer_key,
				oauth_token : tokenObj.oauth_token,
				oauth_version : "1.0",
				content : msg,
				format : "json"

			};

			var message = {
				action : apiURL.update,
				method : "POST",
				parameters : para
			};

			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			$.post(message.action, message.parameters, function(data) {
						log("update post callback.");
						log(data);
						var r = JSON.parse(data);
						var result = new Result();
						result.srvName = "qq";
						result.ok = r.ret == 0;
						result.data = r;
						result.responseText = r.msg || r.content;
						callback(result);
					});
		},

		getUserInfo : function(tokenObj, callback) {
			log('get user info.');

			var accessor = {
				consumerSecret : consumer_secret,
				tokenSecret : tokenObj.oauth_token_secret
			};

			var para = {
				oauth_consumer_key : consumer_key,
				oauth_token : tokenObj.oauth_token,
				oauth_version : "1.0",
				format : "json"
			};

			var message = {
				action : apiURL.userInfo,
				method : "POST",
				parameters : para
			};

			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			$.get(message.action, message.parameters, function(data) {
						log("getUserInfo callback.");
						log(data);
						var r = JSON.parse(data);
						var result = new Result();
						result.srvName = "qq";
						result.ok = r.ret == 0;
						result.data = r;
						result.responseText = r.msg || r.content;
						callback(result);
					});
		},
		getRequestToken : function(callback) {
			var accessor = {
				consumerSecret : consumer_secret
			};
			var para = {
				oauth_consumer_key : consumer_key,
				oauth_version : "1.0",
				oauth_callback : "null"
			};

			var message = {
				action : apiURL.request_token,
				method : "get",
				parameters : para
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			$.get(message.action, message.parameters, function(data) {
				log('get request token call back.');
				log(data);
				var o = Util.parseResponseText(data);
				callback(o);
					// QQApi.authenticate(o.oauth_token, o.oauth_token_secret,
					// callback);
				});
		},
		authenticate : function(callback) {
			log('authenticate....');
			this.getRequestToken(function(requestToken) {
						var accessor = {
							consumerSecret : consumer_secret,
							tokenSecret : requestToken.oauth_token_secret
						};
						var para = {
							oauth_consumer_key : consumer_key,
							oauth_token : requestToken.oauth_token,
							oauth_version : "1.0"
						};

						var message = {
							action : apiURL.authenticate,
							method : "get",
							parameters : para
						};
						OAuth.setTimestampAndNonce(message);
						OAuth.SignatureMethod.sign(message, accessor);
						var url = OAuth.addToURL(apiURL.authenticate,
								message.parameters);

						log(url);

						tmpToken.oauth_token = requestToken.oauth_token;
						tmpToken.oauth_token_secret = requestToken.oauth_token_secret;
						
						var result = new Result();
						result.ok = true;
						result.srvName = "qq";
						callback(result);
						
						chrome.tabs.create({
									url : url
								});
					});

		},
		getAccessToken : function(pin, callback) {
			log(JSON.stringify(tmpToken));
			log('get access token.');

			var accessor = {
				consumerSecret : consumer_secret,
				tokenSecret : tmpToken.oauth_token_secret
			};
			var para = {
				oauth_consumer_key : consumer_key,
				oauth_token : tmpToken.oauth_token,
				oauth_version : "1.0",
				oauth_verifier : pin
			};

			var message = {
				action : apiURL.access_token,
				method : "GET",
				parameters : para
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			log(message);

			$.get(message.action, message.parameters, function(data) {
						log('get access token call back.');
						log(data);

						var result = new Result();
						result.ok = true;
						result.srvName = "qq";
						result.data = Util.parseResponseText(data);
						callback(result);
					});

		}

	};

	var log = function(m) {
		chrome.extension.getBackgroundPage().log(m);
	};

	var consumer_key = "8c0551da0a0b4e1589eca6d3442fd5d8";
	var consumer_secret = "95d1bbdf2281950ba66900fb053a180f";

	var domain_qq = 'http://t.qq.com';

	var api_domain_https = 'https://open.t.qq.com';
	var api_domain_http = 'http://open.t.qq.com';

	var tmpToken = {
		oauth_token : "",
		oauth_token_secret : ""
	};
	var apiURL = {
		update : api_domain_http + '/api/t/add',
		userInfo : api_domain_http + '/api/user/info',

		request_token : api_domain_https + '/cgi-bin/request_token',
		authenticate : api_domain_https + '/cgi-bin/authorize',
		access_token : api_domain_https + '/cgi-bin/access_token'
	};
})(jQuery);
