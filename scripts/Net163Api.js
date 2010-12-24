/**
 * @include "Result.js"
 * @include "util.js"
 */

(function($) {
	Net163Api = {
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
						result.srvName = 'net163';
						result.ok = true;
						
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
				parameters : '',
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
					Net163Api.authenticate(o.oauth_token, o.oauth_token_secret,
							callback);
				},
				error : function(xhr, textStatus, errorThrown) {
					var result = new Result();
					result.srvName = 'net163';
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
					oauth_callback : net163_domain
				},
				signatures : {
					api_key : consumer_key,
					shared_secret : consumer_secret,
					oauth_token : oauth_token,
					oauth_secret : oauth_token_secret
				}
			};
			// var c = ".net163 input[name=pin]";
			// $(c).val(oauth_token);

			log("config:" + JSON.stringify(config));

			var oauthObject = OAuthSimple().sign(config);

			var signedUrl = oauthObject.signed_url;

			tmpToken.oauth_token = oauth_token;
			tmpToken.oauth_token_secret = oauth_token_secret;
			chrome.tabs.create({
						url : signedUrl
					});

		},
		getAccessToken : function(callback) {
			log(JSON.stringify(tmpToken));
			log('get access token.');

			var config = {
				path : apiURL.access_token,
				parameters : {
					"oauth_token" : tmpToken.oauth_token
					// "oauth_verifier" : tmpOauthToken.pin,
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
						result.srvName = "net163";
						result.data = Util.parseResponseText(data);
						callback(result);
					});
		}

	};

	var net163_domain = 'http://t.163.com';
	var api_domain = 'http://api.t.163.com';
	var consumer_key = "nvEarTz6ESkybgKq";
	var consumer_secret = "LKDLe4P6G6GulqNOHwwvRdz3LopqG3Vj";

	var apiURL = {
		update : api_domain + '/statuses/update.json',
		upload : api_domain + '/statuses/upload.json',
		request_token : api_domain + '/oauth/request_token',
		authenticate : api_domain + '/oauth/authenticate',
		access_token : api_domain + '/oauth/access_token'
	};
	var tmpToken = {
		oauth_token : "",
		oauth_token_secret : ""
	};
	var log = function(obj) {
		chrome.extension.getBackgroundPage().log(obj);
	};
})(jQuery);
