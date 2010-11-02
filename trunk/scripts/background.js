/**
 * @include "Result.js"
 */

var doneServices = [];
var allServicesLength = 0;
var currentTabId = -999;

function getDoneServices() {
	return doneServices;
}
function MsgObj() {
	this.mediaType = "";// text,img,link
	this.srcurl = "";
	this.msg = "";
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

	var srcurl = info.srcUrl;
	var shortenedUrl = rPro(srcurl);
	var response = shortenUrl(srcurl);
	if (response.status == "success") {
		shortenedUrl = rPro(response.message);
	}

	var text = chrome.i18n.getMessage("share") + ":" + shortenedUrl;

	var msgObj = new MsgObj();
	msgObj.mediaType = "img";
	msgObj.msg = text;
	msgObj.srcurl = shortenedUrl;

	sendMsg(msgObj);

	return;
}
function linkClick(info, tab) {
	log("link click.");
	var linkurl = info.linkUrl;
	var shortenedUrl = rPro(linkurl);
	var response = shortenUrl(linkurl);
	if (response.status == "success") {
		shortenedUrl = rPro(response.message);
	}

	var text = chrome.i18n.getMessage("share") + ":" + shortenedUrl;

	var msgObj = new MsgObj();
	msgObj.mediaType = "link";
	msgObj.msg = text;
	msgObj.srcurl = shortenedUrl;

	sendMsg(msgObj);
}
function selectionClick(info, tab) {
	log("selection click.");
	var text = info.selectionText;
	text = rPro(text);
	if (text.length > 140) {
		text = text.substr(0, 130) + ".....";
	}

	var msgObj = new MsgObj();
	msgObj.mediaType = "text";
	msgObj.msg = text;

	sendMsg(msgObj);
}
function pageClick(info, tab) {
	log("page click.");

	var title = tab.title || "";
	var purl = tab.url || "";
	var shortenedUrl = rPro(purl);
	var response = shortenUrl(purl);
	if (response.status == "success") {
		shortenedUrl = rPro(response.message);
	}

	var text = chrome.i18n.getMessage("share") + ":" + title + ":"
			+ shortenedUrl;

	var msgObj = new MsgObj();
	msgObj.mediaType = "page";
	msgObj.msg = text;
	msgObj.srcurl = shortenedUrl;

	sendMsg(msgObj);
}
function rPro(url) {
	if (url == null || url == "") {
		return "";
	}
	return url.replace("http://", "").replace("https://", "");
}
function sendMsg(/* MsgObj */content) {

	log(content);
	
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
					if (content.mediaType == "img") {
						SinaApi.upload(content.msg, content.srcurl,
								sendCallback);
					} else {
						SinaApi.update(content.msg, sendCallback);
					}
					break;
				case "twitter" :
					var s = encodeURIComponent(content.msg);
					TwitterApi.update(s, sendCallback);
					break;
				case "follow5" :
					Follow5Api.update(content.msg, sendCallback);
					break;
				case "sohu" :
					SohuApi.update(content.msg, sendCallback);
					break;
			}
		}
	}

	return;
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