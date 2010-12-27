/**
 * @include "Result.js"
 * @include "util.js"
 */

(function($) {
	Net163Api = {
		update : function(msg, tokenObj, callback) {
			log('net163 upate...');

			var accessor = {
				consumerSecret : consumer_secret,
				tokenSecret : tokenObj.oauth_token_secret
			};

			var para = {
				oauth_consumer_key : consumer_key,
				oauth_token : tokenObj.oauth_token,
				status : msg
			};

			var message = {
				action : apiURL.update,
				method : "POST",
				parameters : para
			};

			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			var result = new Result();
			result.srvName = 'net163';
			$.ajax({
						type : "POST",
						data : message.parameters,
						url : message.action,
						timeout : 30 * 1000,
						async : true,
						success : function(data) {
							log('post success.');
							result.ok = true;
							callback(result);

						},
						error : function(xhr, textStatus, errorThrown) {
							log('error.');
							log(xhr);
							log(textStatus);
							log(errorThrown);
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

					});
		},
		getRequestToken : function(callback) {
			log('get request token...');

			var accessor = {
				consumerSecret : consumer_secret
			};
			var para = {
				oauth_consumer_key : consumer_key
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
							oauth_callback : net163_domain
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
						result.srvName = 'net163';
						result.ok = true;

						callback(result);

						chrome.tabs.create({
									url : url
								});

					});
		},
		getAccessToken : function(callback) {
			log(JSON.stringify(tmpToken));
			log('get access token.');

			var accessor = {
				consumerSecret : consumer_secret,
				tokenSecret : tmpToken.oauth_token_secret
			};
			var para = {
				oauth_consumer_key : consumer_key,
				oauth_token : tmpToken.oauth_token
			};

			var message = {
				action : apiURL.access_token,
				method : "get",
				parameters : para
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			$.get(message.action, message.parameters, function(data) {
						log('getAccessToken call back.');
						log(data);
						var result = new Result();
						result.ok = true;
						result.srvName = "net163";
						result.data = Util.parseResponseText(data);
						result.data.name = '已绑定';
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
