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
			$.ajax({
						url : api_default_domain + apiURL.update+"?status="+msg,
						cache : false,
						type : "post",
						async : true,
						dataType : 'json',
						beforeSend : function(req) {
							req.setRequestHeader('Authorization', Util
											.makeBasicAuth(user.loginName,
													user.passWord));
						},
						success : function(data, textStatus) {
							var r = { ok : true };
							callback(r);
						},
						error : function(xhr, textStatus, errorThrown) {
							var r = {};
							try {
								r = JSON.parse(xhr.responseText);
								r = $.extend(r,{ok:false});
							} catch (err) {
								r = {
									ok : false,
									error : "parse error."
								};
							}
							callback(r);
						}
					});
		}
	};
	var api_default_domain = "https://api.twitter.com";

	var apiURL = {
		update : '/statuses/update.json'
	};
})(jQuery);
