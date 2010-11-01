/**
 * @include "Result.js"
 */
(function($) {
	TwitterApi = {
		update : function(msg, callback) {
			
			var user = Util.getObjData("allUserData")['twitter'];
			
			if (user.proxy) {
				api_default_domain = user.proxy;
			}
			if (api_default_domain.lastIndexOf("/") == api_default_domain.length) {
				api_default_domain = api_default_domain.substring(0,
						api_default_domain.length - 1);
			}
			var result = new Result();
			
			//console.log("twitter api default domain:" + api_default_domain);
			
			
			result.srvName="twitter";
			$.ajax({
						url : api_default_domain + apiURL.update+"?status="+msg,
						cache : false,
						type : "post",
						async : true,
						timeout : 30 * 1000,
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
		}
	};
	var api_default_domain = "https://api.twitter.com";

	var apiURL = {
		update : '/statuses/update.json'
	};
})(jQuery);
