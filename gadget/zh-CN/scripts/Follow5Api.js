/**
 * @include "Result.js"
 */

(function($) {
	Follow5Api = {
		update : function(msg, callback) {
			var _data = {
				status : msg,
				source : "share8",
				api_key: api_key
			};
			var user = Util.getObjData("allUserData")['follow5'];
	
			var result = new Result();
			result.srvName="follow5";
		
			$.ajax({
						url : apiURL.update,
						cache : false,
						timeout : 60 * 1000,
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
	
	var api_key = "B1FF0C2256BAD566";
	
	
	var api_domain = 'http://api.follow5.com/api';
	
	var apiURL = {    
        update:                 api_domain + '/statuses/update.json',
        upload:                 api_domain + '/statuses/upload.json'
	};
	
	var log = function(msg){
		System.Debug.outputString(msg);	
	}
})(jQuery);
