/**
 * @include "Result.js"
 */
 
(function($) {
	SohuApi = {
		update : function(msg, callback) {
			var _data = {
				status : msg
			};
			var user = Util.getObjData("allUserData")['sohu'];
	
			var result = new Result();
			result.srvName="sohu";
		
			$.ajax({
						url : apiURL.update,
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
	
	var api_domain = 'http://api.t.sohu.com';
	
	var apiURL = {    
        update:                 api_domain + '/statuses/update.json',
        upload:                 api_domain + '/statuses/upload.json'
	};
})(jQuery);
