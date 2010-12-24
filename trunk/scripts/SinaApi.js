/**
 * @include "Result.js"
 */
 
(function($) {
	SinaApi = {
		updateWithOauth:function (msg,headArr,callback){
			var _data = {
				status : msg,
				source : consumer_key
			};
	
			log("update with oauth...");
			log("msg:"+msg);
			
			var result = new Result();
			result.srvName="sina";
		
			log('.....');
			
			$.ajax({
						url : sinaURL.update,
						cache : false,
						timeout : 30 * 1000,
						type : "post",
						data : _data,
						async : true,
						dataType : 'json',
						beforeSend : function(req) {
							log('set header ' + headArr);
							
							//req.setRequestHeader('OAuth ', headArr);
							req.setRequestHeader('Authorization', headArr);
							/**
							for(var h in headArr){
								log(h + "-" + headArr[h]);
								req.setRequestHeader(h, headArr[h]);
							}
							*/
						},
						success : function(data, textStatus) {
							log('success.');
							result.ok = true;
							result.data = data;
							result.responseText = textStatus;
							
							callback(result);
						},
						error : function(xhr, textStatus, errorThrown) {
							log('error.');
							
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
				status : msg,
				source : consumer_key
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
		},
		
		upload2:function(msg,picurl,callback){
			var _data = {
				status : msg,
				source : consumer_key,
				pic    : picurl
			};
			var e = '<input type="file" name="pic" value="e:\\user\\Desktop\\123.jpg">';
			console.log('099999-----------------------');
			
			$(e).fileUpload({
						url : sinaURL.upload,
						cache : false,
						timeout : 30 * 1000,
						type : "post",
						data : _data,
						async : true,
						dataType: 'json',
						processData: false,
						beforeSend : function(req) {
							req.setRequestHeader('Authorization', Util
											.makeBasicAuth(user.loginName,
													user.passWord));
						},
						success : function(data, textStatus) {
							console.log('success.............');
							console.log(data);
							console.log(textStatus);
							
							
							result.ok = true;
							result.data = data;
							result.responseText = textStatus;
							
							callback(result);
						},
						error : function(xhr, textStatus, errorThrown) {
							
							console.log('error.............');
							console.log(xhr);
							console.log(textStatus);
							
							
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
		upload : function(msg,picurl, callback) {
			var _data = {
				status : msg,
				source : consumer_key,
				pic    : picurl
			};
			var user = Util.getObjData("allUserData")['sina'];
	
			var result = new Result();
			result.srvName="sina";
			
			var filename = "E:\\user\\Desktop\\123.jpg";
			var boundary = '----multipartformboundary' + (new Date).getTime();
    var dashdash = '--';
    var crlf     = '\r\n';

    /* Build RFC2388 string. */
    var builder = '';

    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [SOURCE KEY] */            
    builder += 'Content-Disposition: form-data; name="source"';
    builder += crlf;
    builder += crlf; 

    /* Append form data. */
    builder += consumer_key;
    builder += crlf;

    /* Write boundary. */
    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [STATUS] */            
    builder += 'Content-Disposition: form-data; name="status"';
    builder += crlf;
    builder += crlf; 

    /* Append form data. */
    builder += msg;
    builder += crlf;

    /* Write boundary. */
    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [PIC] */            
    builder += 'Content-Disposition: form-data; name="pic"';
      builder += '; filename="123.jpg"';
    builder += crlf;

    builder += 'Content-Type: image/jpg';
    builder += crlf;
    builder += crlf; 

    var reader = new FileReader();
    reader.onload = function(){};
    var v = reader.readAsBinaryString(filename);
    /* Append binary data.*/
    builder += v;//file.getAsBinary();
    builder += crlf;
	
	console.log('start..');
	
	
	//var reader = new FileReader();
   // var fb = reader.readAsBinaryString(filename);
//    var b = false;
//    reader.onloadend = function (e){
//    	
//    	b = true;
//    };
//    while(!b){
//    	//
//    	console.log('....');
//    }
    //console.log('ok.'+fb);
    
    var bb = new BlobBuilder(); //NOTE
    bb.append(builder);
    bb.append(v);
    builder = crlf;
    
    /* Mark end of the request.*/ 
    builder += dashdash;
    builder += boundary;
    builder += dashdash;
    builder += crlf;

    bb.append(builder);
    
		    
		    
		    //console.log(builder);
    
			$.ajax({
						url : sinaURL.upload,
						cache : false,
						timeout : 30 * 1000,
						type : "post",
						data : bb.getBlob(),
						async : true,
						dataType: 'text',
						contentType: 'multipart/form-data; boundary=' + boundary,
						processData: false,
						beforeSend : function(req) {
							req.setRequestHeader('Authorization', Util
											.makeBasicAuth(user.loginName,
													user.passWord));
						},
						success : function(data, textStatus) {
							console.log('success.............');
							console.log(data);
							console.log(textStatus);
							
							
							result.ok = true;
							result.data = data;
							result.responseText = textStatus;
							
							callback(result);
						},
						error : function(xhr, textStatus, errorThrown) {
							
							console.log('error.............');
							console.log(xhr);
							console.log(textStatus);
							
							
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
	
	var log = function(m){
		chrome.extension.getBackgroundPage().log(m);
	};
	var consumer_key = "1223946471";
	var consumer_secret = "6206f373acd22f67f54535553d560fdc";
	var domain_sina = 'http://t.sina.com.cn';
	var api_domain_sina = 'http://api.t.sina.com.cn';
	
	var sinaURL = {    
        update:                 api_domain_sina + '/statuses/update.json',
        upload:                 api_domain_sina + '/statuses/upload.json',
        request_token:          api_domain_sina + '/oauth/request_token',
        authenticate:           api_domain_sina + '/oauth/authenticate',
        access_token:           api_domain_sina + '/oauth/access_token'
	};
})(jQuery);
