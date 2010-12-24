/**
 * @include "util.js"
 * @include "Result.js"
 */

var tmpOauthToken = {};

function oauth(type) {
	switch (type) {
		case 'net163' :
			Net163Api.oauth(oauthCallBack);
			break;
		case 'qq' :
			QQApi.oauth(oauthCallBack);
			break;
	}
}
function savePin(type) {
	switch(type){
		case 'net163':
			Net163Api.getAccessToken(oauthCallBack);
		break;
		case 'qq':
			var pin = $(".qq input[name=pin]").val();
			QQApi.getAccessToken(pin, oauthCallBack);
		break;
	}
}


function testMsg(type) {
	var msg = "test2" + Math.random() + "wow";

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
		case 'qq' :
			o = {
				path : "http://open.t.qq.com/api/t/add",
				parameters : {
					"format":"json",
					"content":msg
					,"clientip":"127.0.0.1"
					//"jing":"234.2",
					//"wei":"33",
					,"oauth_token" : tokenObj.oauth_token
					,"oauth_version":"1.0"
				},
				signatures : {
					consumer_key : "8c0551da0a0b4e1589eca6d3442fd5d8",
					shared_secret : "95d1bbdf2281950ba66900fb053a180f",
					oauth_secret : tokenObj.oauth_token_secret
				}
			};
			break;
	}
	log("obj:" + JSON.stringify(o));

	var oauthObject = OAuthSimple().sign(o);

	var url = oauthObject.signed_url;

	log("url:" + url);
	$.get(url, null, function(d) {
				log('post2 callback.');
				log(d);
			});

}
function getUserInfo(type){
	window.setInterval("getUserInfo2('qq')",30000);
}
function getUserInfo2(type){
	var msg = "test2 " + Math.random() + " wow.";

	var tokenObj = Util.getObjData("accessToken")[type];
	var o = {
				path : "http://open.t.qq.com/api/user/info",
				parameters : {
					"format":"json",
					"oauth_token" : tokenObj.oauth_token,
					"oauth_version":"1.0"
				},
				signatures : {
					consumer_key : "8c0551da0a0b4e1589eca6d3442fd5d8",
					shared_secret : "95d1bbdf2281950ba66900fb053a180f",
					oauth_secret : tokenObj.oauth_token_secret
				}
			};
	log("obj:" + JSON.stringify(o));

	var oauthObject = OAuthSimple().sign(o);

	var url = oauthObject.signed_url;

	log("url:" + url);
	$.get(url, null, function(d) {
				log('post2 callback.');
				log(d);
			});
}
function oauthCallBack(/* Result */r) {
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