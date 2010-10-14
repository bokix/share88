(function($) {
	TwitterApi = {
		update : function(msg, completeCallBack) {
			
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
						timeout : 60 * 1000, // 一分钟超时
						type : "post",
						async : false,
						dataType : 'json',
						beforeSend : function(req) {
							req.setRequestHeader('Authorization', Util
											.makeBasicAuth(user.loginName,
													user.passWord));
						},
						complete : completeCallBack
					});
		}
	};

	var api_default_domain = "https://api.twitter.com";

	var apiURL = {
		update : '/statuses/update.json'
	};
})(jQuery);
