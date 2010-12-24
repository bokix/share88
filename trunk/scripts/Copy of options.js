/**
 * @include "util.js"
 * @include "Result.js"
 */

var tmpOauthToken = {};

function oauth(type) {
	switch (type) {
		case 'net163' :
			Net163Api.oauth(cb);
			break;
		case 'sina' :
			SinaApi.oauth(cb);
			break;
	}
}
function getRequestToken(/* String */type) {
	log('get ' + type + ' request token...');

	var config = {};
	switch (type) {
		case 'sina' :
			config = {
				path : SinaApi.getApiUrl().request_token,
				parameters : '',
				signatures : {
					api_key : SinaApi.getConsumerKey(),
					shared_secret : SinaApi.getConsumerSecret()
				}
			};
			break;
		case 'net163' :
			config = {
				path : Net163Api.getApiUrl().request_token,
				parameters : '',
				signatures : {
					api_key : Net163Api.getConsumerKey(),
					shared_secret : Net163Api.getConsumerSecret()
				}
			};
			break;
	}

	log("config:" + JSON.stringify(config));

	var oauthObject = OAuthSimple().sign(config);

	var signedUrl = oauthObject.signed_url;

	log(signedUrl);
	log('');

	$.get(signedUrl, null, function(/* String */data) {

				log('get request token call back:');
				log(data);
				log("");

				var o = parseResponseText(data);

				tmpOauthToken = {};
				tmpOauthToken.oauth_token = o.oauth_token;
				tmpOauthToken.oauth_token_secret = o.oauth_token_secret;

				authenticate(o.oauth_token, o.oauth_token_secret, type);
			});

	return true;
}

function authenticate(oauth_token, oauth_token_secret, type) {
	log(type + ' authenticate with [token:' + oauth_token + "][secret:"
			+ oauth_token_secret + "]");

	var config = {};
	switch (type) {
		case 'sina' :
			config = {
				path : SinaApi.getApiUrl().authenticate,
				parameters : '',
				signatures : {
					api_key : SinaApi.getConsumerKey(),
					shared_secret : SinaApi.getConsumerSecret(),
					oauth_token : oauth_token,
					oauth_secret : oauth_token_secret
				}
			};
			break;
		case 'net163' :
			config = {
				path : Net163Api.getApiUrl().authenticate,
				parameters : {
					oauth_callback : "http://localhost:8080/demo/test.jsp"
				},
				signatures : {
					api_key : Net163Api.getConsumerKey(),
					shared_secret : Net163Api.getConsumerSecret(),
					oauth_token : oauth_token,
					oauth_secret : oauth_token_secret
				}
			};
			var c = ".net163 input[name=pin]";
			$(c).val(oauth_token);
			break;
	}

	log("config:" + JSON.stringify(config));

	var oauthObject = OAuthSimple().sign(config);

	var signedUrl = oauthObject.signed_url;

	chrome.tabs.create({
				url : signedUrl
			});
}

function savePin2(type) {
	var c = "." + type + " input[name=pin]";
	var pin = $(c).val();

	tmpOauthToken.pin = pin;

	log('');
	log(JSON.stringify(tmpOauthToken));
	log('');

	getAccessToken(type);

}
function savePin(type) {
	switch(type){
		case 'net163':
			Net163Api.getAccessToken(cb);
		break;
		
		
	}

}

function getAccessToken(type) {
	log('get ' + type + ' access token.');

	var config = {};

	switch (type) {
		case 'sina' :
			config = {
				path : SinaApi.getApiUrl().access_token,
				parameters : {
					"oauth_token" : tmpOauthToken.oauth_token,
					"oauth_verifier" : tmpOauthToken.pin
				},
				signatures : {
					consumer_key : SinaApi.getConsumerKey(),
					shared_secret : SinaApi.getConsumerSecret(),
					oauth_secret : tmpOauthToken.oauth_token_secret
				}
			};
			break;
		case 'net163' :
			config = {
				path : Net163Api.getApiUrl().access_token,
				parameters : {
					"oauth_token" : tmpOauthToken.oauth_token
					// "oauth_verifier" : tmpOauthToken.pin,
				},
				signatures : {
					consumer_key : Net163Api.getConsumerKey(),
					shared_secret : Net163Api.getConsumerSecret(),
					oauth_secret : tmpOauthToken.oauth_token_secret
				}
			};
			break;
	}

	log("config:" + JSON.stringify(config));

	var oauthObject = OAuthSimple().sign(config);

	var signedUrl = oauthObject.signed_url;

	log(signedUrl);

	$.get(signedUrl, null, function(data) {
				log('get access token call back.');
				log(data);

				var accessToken = Util.getObjData("accessToken") || {};
				accessToken[type] = parseResponseText(data);

				log('to save access token');
				log(JSON.stringify(accessToken));

				Util.saveData("accessToken", JSON.stringify(accessToken));

			});
}

function testMsg4sina_ok() {
	var msg = "test " + Math.random() + " wow.";

	var tokenObj = {
		"oauth_token" : "6b22ca7602bec2f76ddf9e7e71702504",
		"oauth_token_secret" : "b67cdeab8e881a4da0692a409d2d9295",
		"user_id" : "1827565393"
	};
	var o = {
		action : "POST",
		path : SinaApi.getApiUrl().update,
		parameters : {
			'status' : msg
		},
		signatures : {
			consumer_key : SinaApi.getConsumerKey(),
			shared_secret : SinaApi.getConsumerSecret(),
			oauth_secret : tokenObj.oauth_token_secret,
			oauth_token : tokenObj.oauth_token
		}
	};

	log("obj:" + JSON.stringify(o));

	var oauthObject = OAuthSimple().sign(o);

	var url = oauthObject.signed_url;

	log("url:" + url);
	$.post(url, null, function(d) {
				log('post callback.');
				log(d);
			});

	$.get(url, null, function(d) {
				log('call back');
				log(d);
			});

	// log("------------------------");
	// //log(JSON.stringify(oauthObject));
	// var hs = oauthObject.header;
	// log("head string:" + hs);
	//	
	// //hs = hs.substring(6,hs.length).replace(/\s/g,",");
	// //if(hs.lastIndexOf(",")==hs.length-1){
	// // hs = hs.substring(0,hs.length-1);
	// // }
	// //log("2:" + hs);
	// //hs = parseResponseText(hs);
	//	
	// //for(var i in hs){
	// //alert(i+":" + hs[i]);
	// //}
	// SinaApi.updateWithOauth(msg,hs,cb);

}

function testMsg(type) {
	var msg = "test2 " + Math.random() + " wow.";

	var tokenObj = Util.getObjData("accessToken")[type];
	var o = {};
	switch (type) {
		case 'net163' :
			o = {
				path : "http://api.t.163.com/statuses/update.json",
				action : 'post',
				parameters : {
					status : msg
				},
				signatures : {
					consumer_key : "nvEarTz6ESkybgKq",
					shared_secret : "LKDLe4P6G6GulqNOHwwvRdz3LopqG3Vj",
					oauth_token : tokenObj.oauth_token,
					oauth_secret : tokenObj.oauth_token_secret
				}
			};
			break;
	}
	log("obj:" + JSON.stringify(o));

	var oauthObject = OAuthSimple().sign(o);

	var url = oauthObject.signed_url;

	log("url:" + url);
	$.post(url, null, function(d) {
				log('post2 callback.');
				log(d);
			});

}

function cb(/* Result */r) {
	log(r);
	if (!r.ok) {
		log('error.' + r.responseText);
		return;
	}
	var accessToken = Util.getObjData("accessToken") || {};
	accessToken[r.srvName] = r.data;

	log('to save access token');
	log(JSON.stringify(accessToken));

	Util.saveData("accessToken", JSON.stringify(accessToken));
}


function log(obj) {
	chrome.extension.getBackgroundPage().log(obj);
}

function save(type) {
	var inputClsKey = "." + type + " input"; // like: ".sina input"
	var allUserData = Util.getObjData("allUserData") || {};
	allUserData[type] = {};
	$(inputClsKey).each(function() {
				allUserData[type][this.name] = this.value;
			});
	Util.saveData("allUserData", JSON.stringify(allUserData));

	var allServices = Util.getObjData("alreadyServices") || {};

	if (!allServices[type]) {
		allServices[type] = true;
		showServices(type);
		Util.saveData("alreadyServices", JSON.stringify(allServices));
	}
}
function showServices(type) {
	var allUserData = Util.getObjData("allUserData") || {};
	var srv = "<a class='bindmsg bindmsg-" + type + "'>"
			+ allUserData[type].loginName
			+ "</a><a href='#' onclick=\"remove('" + type + "')\">"
			+ chrome.i18n.getMessage("removeBind");
	$(".alreadyServices ul")
			.append("<li class='" + type + "'>" + srv + "</li>");
}

function remove(type) {
	// var c = ".alreadyServices li:contains('" + type + "')";
	$(".alreadyServices").find("." + type).remove();
	// $(c).remove();
	var allServices = Util.getObjData("alreadyServices") || {};
	delete allServices[type];
	Util.saveData("alreadyServices", JSON.stringify(allServices));

	var allUserData = Util.getObjData("allUserData") || {};
	delete allUserData[type];
	Util.saveData("allUserData", JSON.stringify(allUserData));
}

function loadPage() {
	var allServices = Util.getObjData("alreadyServices") || {};
	for (var i in allServices) {
		if (allServices[i]) {
			showServices(i);
		}
	}
}

function onLoadOptionPage() {
	$("#mainTabs").tabs();
	$(".tabs-page a").button();
	$("#divOptionsBottom #btnSave").button("option", "icons", {
				primary : 'ui-icon-disk'
			});

	loadPage();
}