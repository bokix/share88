/**
 * @include "Result.js"
 */
 
(function($) {
	SinaApi = {
		updateWithOauth:function (msg, tokenObj, callback){
			log('updateWithOauth...');
			var result = new Result();
			result.srvName="sina";
			var accessor = {
				consumerSecret : tokenObj.secret,
				tokenSecret : tokenObj.oauth_token_secret
			};

			log('accessor:' + JSON.stringify(accessor));
			
			var para = {
				oauth_consumer_key : tokenObj.key,
				oauth_token : tokenObj.oauth_token,
				oauth_version : "1.0",
				//content : msg,
				//format : "json",
				status : msg
				//,source : tokenObj.key
			};

			log('para:' + JSON.stringify(para));
			
			var message = {
				action : sinaURL.update,
				method : "POST",
				parameters : para
			};
			
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			
			log('message:' + JSON.stringify(message));

			/**
			$.post(message.action, message.parameters, function(data) {
						log("update post callback.");
						log(data);
						var r = JSON.parse(data);
						var result = new Result();
						result.srvName = "sina";
						result.ok = r.ret == 0;
						result.data = r;
						result.responseText = r.msg || r.content;
						callback(result);
					});
					*/
			$.ajax({
						url : message.action,
						cache : false,
						timeout : 30 * 1000,
						type : "post",
						data : message.parameters,
						async : true,
						dataType : 'json',
						success : function(data, textStatus) {
							log('success.');
							log(JSON.stringify(data));
							log('success.textStatus:' + JSON.stringify(textStatus));
							
							result.ok = true;
							result.data = "success";// data;
							result.responseText = textStatus;
							
							callback(result);
						},
						error : function(xhr, textStatus, errorThrown) {
							log('error.');
							log('xhr:' + JSON.stringify(xhr));
							log('textStatus:' + JSON.stringify(textStatus));
							log('errorThrown:' + JSON.stringify(errorThrown));
							
							result.ok = false;
							try {
								result.responseText = textStatus;
								if(xhr.responseText){
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
		update : function(msg, callback) {
			var _data = {
				"status" : msg,
				"source" : consumer_key
			};
			var user = Util.getObjData("allUserData")['sina'];
	
			var result = new Result();
			result.srvName="sina";
			log("--------------------------------");
			log("send data:");
			log(_data);
		
			$.ajax({
						url : sinaURL.update,
						cache : false,
						timeout : 30 * 1000,
						type : "post",
						data : _data,
						async : true,
						dataType : 'json',
						beforeSend : function(req) {
							req.setRequestHeader('Authorization', Util
											.makeBasicAuth(user.loginName,
													user.passWord));
						},
						success : function(data, textStatus) {
							result.ok = true;
							result.data = data;
							result.responseText = textStatus;
							
							callback(result);
						},
						error : function(xhr, textStatus, errorThrown) {
							result.ok = false;
							try {
								result.responseText = textStatus;
								if(xhr.responseText){
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
			log('getRequestToken...');
			var accessor = {
				consumerSecret : tmpToken.secret
			};
			var para = {
				oauth_consumer_key : tmpToken.key
				,oauth_version : "1.0"
				//,oauth_callback : "http://localhost"
			};

			var message = {
				action : sinaURL.request_token,
				method : "get",
				parameters : para
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			log(message);
			
			$.get(message.action, message.parameters, function(data) {
				log('get request token call back.');
				log(data);
				var o = Util.parseResponseText(data);
				callback(o);
				});
			/**
			$.post(message.action, message.parameters, function(data) {
				log('post request token call back.');
				log(data);
				var o = Util.parseResponseText(data);
				callback(o);
					// QQApi.authenticate(o.oauth_token, o.oauth_token_secret,
					// callback);
				});
			*/
		},
		authenticate : function(_selfKey,_selfSecret,callback) {
			log('authenticate....');
			log('_selfKey:' + _selfKey);
			log('_selfSecret:' + _selfSecret);
			
			
			if(_selfKey && _selfKey!=""){
				tmpToken.key = _selfKey;
			}
			if(_selfSecret && _selfSecret!=""){
				tmpToken.secret = _selfSecret;
			}
			
			log('tmpToken:' + JSON.stringify(tmpToken));
			
			this.getRequestToken(function(requestToken) {
						log('start authenticate...');
						
						var accessor = {
							consumerSecret : tmpToken.secret,
							tokenSecret : requestToken.oauth_token_secret
						};
						var para = {
							oauth_consumer_key : tmpToken.key,
							oauth_token : requestToken.oauth_token,
							oauth_version : "1.0"
						};

						var message = {
							action : sinaURL.authenticate,
							method : "get",
							parameters : para
						};
						OAuth.setTimestampAndNonce(message);
						OAuth.SignatureMethod.sign(message, accessor);
						var url = OAuth.addToURL(sinaURL.authenticate,
								message.parameters);

						log(url);

						tmpToken.oauth_token = requestToken.oauth_token;
						tmpToken.oauth_token_secret = requestToken.oauth_token_secret;
						
						var result = new Result();
						result.ok = true;
						result.srvName = "sina";
						//callback(result);
						
						window.location=url;
					});

		},
		getAccessToken : function(pin, callback) {
			log(JSON.stringify(tmpToken));
			log('get access token.');

			var accessor = {
				consumerSecret : tmpToken.secret,
				tokenSecret : tmpToken.oauth_token_secret
			};
			var para = {
				oauth_consumer_key : tmpToken.key,
				oauth_token : tmpToken.oauth_token,
				oauth_version : "1.0",
				oauth_verifier : pin
			};

			var message = {
				action : sinaURL.access_token,
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
						result.srvName = "sina";
						result.data = Util.parseResponseText(data);
						result.data['key'] = tmpToken.key;
						result.data['secret'] = tmpToken.secret;
						callback(result);
					});

		}
	};
	
	var log = function(m){
		System.Debug.outputString(m);
	};
	
	//ø≤À˛¿≠
	/**
	var consumer_key = "1223946471";
	var consumer_secret = "6206f373acd22f67f54535553d560fdc";
	*/
	
	//≈Ó¿≥œ…µ∫
	var consumer_key = "2563927173";
	var consumer_secret = "503bcd36b9677ce50b3a311740e7c0c6";
	
	var domain_sina = 'http://t.sina.com.cn';
	var api_domain_sina = 'http://api.t.sina.com.cn';
	var tmpToken = {
		oauth_token : "",
		oauth_token_secret : "",
		key:consumer_key,
		secret:consumer_secret
	};
	var sinaURL = {    
        update:                 api_domain_sina + '/statuses/update.json',
        upload:                 api_domain_sina + '/statuses/upload.json',
        request_token:          api_domain_sina + '/oauth/request_token',
        authenticate:           api_domain_sina + '/oauth/authenticate',
        access_token:           api_domain_sina + '/oauth/access_token'
	};
})(jQuery);
