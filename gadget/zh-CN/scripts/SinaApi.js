/**
 * @include "Result.js"
 */
 
(function($) {
	SinaApi = {
		update : function(msg, callback) {
			var _data = {
				status : msg,
				source : app_source
			};
			var user = Util.getObjData("allUserData")['sina'];
	
			var result = new Result();
			result.srvName="sina";
		
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
		}
	};
	
	var app_source = "1223946471";
	var domain_sina = 'http://t.sina.com.cn';
	var api_domain_sina = 'http://api.t.sina.com.cn';
	
	var sinaURL = {    
        update:                 api_domain_sina + '/statuses/update.json',
        upload:                 api_domain_sina + '/statuses/upload.json'
	};
	
	var log = function(msg){
		System.Debug.outputString(msg);	
	}
})(jQuery);
