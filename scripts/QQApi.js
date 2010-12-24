/**
 * @include "Result.js"
 * @include "util.js"
 */

(function($) {
	QQApi = {
		callAjax : function(opt) {
			var p = {
				timeout : 30 * 1000,
				type : "POST",
				async : true
			};

			var prop = {};
			$.extend(prop, p, opt);
			$.ajax(prop);
		},
		update : function(msg, tokenObj, callback) {
			var o = {
				path : apiURL.update,
				action : 'post',
				parameters : {
					status : msg
				},
				signatures : {
					consumer_key : consumer_key,
					shared_secret : consumer_secret,
					oauth_token : tokenObj.oauth_token,
					oauth_secret : tokenObj.oauth_token_secret
				}
			};

			var oauthObject = OAuthSimple().sign(o);

			var url = oauthObject.signed_url;

			$.post(url, null, function(d) {
						log('post2 callback.');
						log(d);
						var result = new Result();
						result.srvName = 'qq';
						result.ok = true;

						callback(result);
					});
		},

		getUserInfo : function(tokenObj, callback) {
			var o = {
				path : apiURL.userInfo,
				parameters : {
					"format" : "json",
					"oauth_token" : tokenObj.oauth_token,
					"oauth_version" : "1.0"
				},
				signatures : {
					consumer_key : consumer_key,
					shared_secret : consumer_secret,
					oauth_secret : tokenObj.oauth_token_secret
				}
			};
			log("obj:" + JSON.stringify(o));

			var oauthObject = OAuthSimple().sign(o);

			var url = oauthObject.signed_url;

			log("url:" + url);
			$.get(url, null, function(d) {
						var result = new Result();
						result.srvName = "qq";
						result.ok = true;
						result.data = d;
						callback(result);

					});
		},
		oauth : function(callback) {
			this.getRequestToken(callback);
		},
		getRequestToken : function(callback) {
			log('get request token...');

			var config = {
				path : apiURL.request_token,
				parameters : {
					oauth_callback : 'null',
					oauth_version : "1.0"
				},
				signatures : {
					api_key : consumer_key,
					shared_secret : consumer_secret
				}
			};
			var oauthObject = OAuthSimple().sign(config);

			var signedUrl = oauthObject.signed_url;

			log(signedUrl);

			var opt = {
				url : signedUrl,
				type : "GET",
				success : function(data, textStatus) {
					var o = Util.parseResponseText(data);
					QQApi.authenticate(o.oauth_token, o.oauth_token_secret,
							callback);
				},
				error : function(xhr, textStatus, errorThrown) {
					var result = new Result();
					result.srvName = 'qq';
					result.ok = false;
					try {
						result.responseText = textStatus;
						if (xhr.responseText) {
							result.data = JSON.parse(xhr.responseText);
							result.responseText = result.data.error;
						}
					} catch (err) {
						result.responseText = "parse error.";
					}
					callback(result);
				}
			};

			this.callAjax(opt);
		},
		authenticate : function(oauth_token, oauth_token_secret, callback) {
			log('authenticate....');

			var config = {
				path : apiURL.authenticate,
				parameters : {
					oauth_callback : "null"
				},
				signatures : {
					api_key : consumer_key,
					shared_secret : consumer_secret,
					oauth_token : oauth_token,
					oauth_secret : oauth_token_secret
				}
			};

			log("config:" + JSON.stringify(config));

			var oauthObject = OAuthSimple().sign(config);

			var signedUrl = oauthObject.signed_url;

			tmpToken.oauth_token = oauth_token;
			tmpToken.oauth_token_secret = oauth_token_secret;
			chrome.tabs.create({
						url : signedUrl
					});

		},
		getAccessToken : function(pin, callback) {
			log(JSON.stringify(tmpToken));
			log('get access token.');

			var config = {
				path : apiURL.access_token,
				parameters : {
					"oauth_token" : tmpToken.oauth_token,
					"oauth_version" : "1.0",
					"oauth_verifier" : pin
				},
				signatures : {
					consumer_key : consumer_key,
					shared_secret : consumer_secret,
					oauth_secret : tmpToken.oauth_token_secret
				}
			};

			log("config:" + JSON.stringify(config));

			var oauthObject = OAuthSimple().sign(config);

			var signedUrl = oauthObject.signed_url;

			log(signedUrl);

			$.get(signedUrl, null, function(data) {
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
	// var domain_qq = 'http://t.qq.com';
	var domain_qq = 'http://localhost:8080/demo/test.jsp';

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
