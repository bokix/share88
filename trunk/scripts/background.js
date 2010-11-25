/**
 * @include "Result.js"
 * @include "MsgObj.js"
 */

var doneServices = [];
var allServicesLength = 0;
var currentTabId = -999;

function getDoneServices() {
	return doneServices;
}
function background() {
	var title = chrome.i18n.getMessage("extName");
	chrome.contextMenus.create({
				"title" : title,
				"contexts" : ["all"],
				"onclick" : contextMenuClick
			});

}
function contextMenuClick(info, tab) {
	log(JSON.stringify(info));
	log(JSON.stringify(tab));

	var type = info.mediaType;
	// var pageurl=info.pageUrl;
	// var srcurl=info.srcUrl;
	// var title=tab.title||"";
	// var purl=tab.url||"";
	var text = info.selectionText;
	var link = info.linkUrl;
	if (text) {
		// 优先以选择文本的方式发送
		selectionClick(info, tab);
	} else if (type) {
		// One of 'image', 'video', or 'audio'
		mediaClick(info, tab);
	} else if (link) {
		linkClick(info, tab);
	} else {
		pageClick(info, tab);
	}

	// text = encodeURIComponent(text.replace("http://", ""));
	// sendMsg(text);

}
function mediaClick(info, tab) {
	log("media click.");

	var msgObj = new MsgObj();

	msgObj.mediaType = "img";
	msgObj.sourceUrl = info.srcUrl;

	var response = shortenUrl(info.srcUrl);
	if (response.status == "success") {
		msgObj.shortUrl = response.message;
	}

	sendMsg(msgObj);

	return;
}
function linkClick(info, tab) {
	log("link click.");

	var msgObj = new MsgObj();
	
	msgObj.mediaType = "link";
	msgObj.sourceUrl = info.linkUrl;
	
	var response = shortenUrl(info.linkUrl);
	if (response.status == "success") {
		msgObj.shortUrl = response.message;
	}

	sendMsg(msgObj);
}
function selectionClick(info, tab) {
	log("selection click.");

	var msgObj = new MsgObj();
	
	msgObj.mediaType = "text";
	
	var text = info.selectionText;
	if (text.length > 140) {
		text = text.substr(0, 130) + ".....";
	}

	msgObj.msg = text;

	sendMsg(msgObj);
}
function pageClick(info, tab) {
	log("page click.");

	var msgObj = new MsgObj();
	msgObj.mediaType = "page";

	var title = tab.title || "";
	var purl = tab.url || "";
	
	msgObj.msg = title;
	msgObj.sourceUrl = purl;
	
	var response = shortenUrl(purl);
	if (response.status == "success") {
		msgObj.shortUrl = response.message;
	}

	sendMsg(msgObj);
}

/**
 * twitter需要把消息中的http去掉。
 * 
 * @param {} url
 * @return {String}
 */
function rPro(url) {
	if (url == null || url == "") {
		return "";
	}
	return url.replace("http://", "").replace("https://", "");
}

function sendMsg(/* MsgObj */msgObj) {

	log(msgObj);
	
	chrome.tabs.getSelected(null, function(tab) {
				currentTabId = tab.id;
				chrome.browserAction.setBadgeText({
							text : "0/0",
							tabId : currentTabId
						});
				chrome.browserAction.setBadgeBackgroundColor({
							color : [255, 215, 0, 255],
							tabId : currentTabId
						});
			});

	doneServices = new Array();
	var allServices = Util.getObjData("alreadyServices");

	var sumServ = 0;
	for (var i in allServices) {
		if (allServices[i]) {
			sumServ++;
		}
	}

	if (sumServ == 0) {
		chrome.tabs.create({
					url : 'options.html'
				});
		return false;
	}

	allServicesLength = sumServ;

	for (var service in allServices) {
		if (allServices[service]) {
			switch (service) {
				case "sina" :
					SinaApi.update(getMeg4send(msgObj,"sina"), sendCallback);
					break;
				case "twitter" :
					TwitterApi.update(getMeg4send(msgObj,"twitter"), sendCallback);
					break;
				case "follow5" :
					Follow5Api.update(getMeg4send(msgObj,"follow5"), sendCallback);
					break;
				case "sohu" :
					SohuApi.update(getMeg4send(msgObj,"sohu"), sendCallback);
					break;
				case "net163" :
					Net163Api.update(getMeg4send(msgObj,"net163"), sendCallback);
					break;
			}
		}
	}

	return;
}

/**
 * 不同服务器对于发送的消息要求不同，如：新浪对于发送的内容不允许有除新浪自己以外的短网址！！
 * 
 * @param {}
 *            msgObj
 * @param {}
 *            serverType
 */
function getMeg4send(/* MsgObj */ msgObj, /* String */ serverType){
	var msg = "";
	switch(msgObj.mediaType){
		case "text":
			msg = msgObj.msg;
			break;
		case "link":
		case "img":
		case "page":
			msg = chrome.i18n.getMessage("share") + ":" + msgObj.msg + " ";
			if(serverType=="sina"){
				msg += msgObj.sourceUrl;
			}else{
				msg += msgObj.shortUrl;
			}
			break;
		
		default:
			msg += msgObj.msg;
			break;
	}
	
	if(serverType=="twitter" || serverType == "sohu"){
		msg = encodeURIComponent(rPro(msg));
	}
	
	log("get msg of "+serverType + " with mediaType[" + msgObj.mediaType + "].");
	log("result msg:" + msg);
	
	return msg;
}


function sendCallback(/* Result */result) {

	log("send call bacl execute..." + result.srvName);
	log(result);
	log("-------------------------");

	doneServices[doneServices.length] = result;

	// log(doneServices);
	var sumError = 0;
	var sumSuccess = 0;
	for (var i in doneServices) {
		if (!doneServices[i].ok) {
			sumError++;
		}
	}
	sumSuccess = doneServices.length - sumError;

	var txt = "";
	var col = [];

	if (doneServices.length == allServicesLength) { // all task done.
		txt = sumSuccess + "/" + allServicesLength;
		col = [0, 255, 0, 255];
	} else {
		txt = sumSuccess + "/" + doneServices.length;
		col = [255, 215, 0, 255];
	}

	chrome.browserAction.setBadgeText({
				text : txt,
				tabId : currentTabId
			});
	chrome.browserAction.setBadgeBackgroundColor({
				color : col,
				tabId : currentTabId
			});
}

function shortenUrl(url) {

	var shortenService = Util.getData('shortServices');

	switch (shortenService) {
		case "is.gd" :
			return shortenUrlByIsgd(url);
			break;
		case "aa.cx" :
			return shortenUrlByAacx(url);
			break;
		case "goo.gl" :
		default :
			return shortenUrlByGoogl(url);
			break;
	}
}

function shortenUrlByGoogl(url) {
	var response;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "http://goo.gl/api/url?user=toolbar@google.com&url="
					+ encodeURIComponent(url) + "&auth_token="
					+ getAuthToken(url), false);
	xmlhttp.onload = function() {
		var object = JSON.parse(xmlhttp.responseText);

		if (object["short_url"] == undefined)
			response = {
				status : "error",
				message : object["error_message"]
			};
		else
			response = {
				status : "success",
				message : object["short_url"]
			};
	};
	xmlhttp.send(null);

	return response;
}

function shortenUrlByIsgd(url) {
	var response;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "http://is.gd/api.php?longurl="
					+ encodeURIComponent(url), false);
	xmlhttp.onload = function() {
		if (200 == xmlhttp.status)
			response = {
				status : "success",
				message : xmlhttp.responseText
			};
		else
			response = {
				status : "error",
				message : "Internal server error!"
			};
	};
	xmlhttp.send(null);

	return response;
}

function shortenUrlByAacx(url) {
	var response;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "http://aa.cx/api.php?url=" + encodeURIComponent(url),
			false);
	xmlhttp.onload = function() {
		if (200 == xmlhttp.status)
			response = {
				status : "success",
				message : xmlhttp.responseText
			};
		else
			response = {
				status : "error",
				message : "Internal server error!"
			};
	};
	xmlhttp.send(null);

	return response;
}

function log(o) {
	console.log(o);
}