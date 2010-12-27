/**
 * @include "Result.js"
 * @include "MsgObj.js"
 * @include "util.js"
 * 
 */


var doneServices = [];
var allServicesLength = 0;
var currentTabId = -999;
var g_msg = "";

function getDoneServices() {
	return doneServices;
}
function background() {
	var title = chrome.i18n.getMessage("extName");
	var subTitleEdit = chrome.i18n.getMessage("subTitleEdit");
	var subTitleSend = chrome.i18n.getMessage("subTitleSend");

	var parentid = chrome.contextMenus.create({
				"title" : title,
				"contexts" : ["all"],
				"onclick" : subTitleEditClick
			});
	/**
	chrome.contextMenus.create({
				"title" : subTitleEdit,
				"onclick" : subTitleEditClick,
				"contexts" : ["all"],
				"parentId" : parentid
			});
	chrome.contextMenus.create({
				"title" : subTitleSend,
				"onclick" : subTitleSendClick,
				"contexts" : ["all"],
				"parentId" : parentid
			});
	*/
}

/**
 * 先编辑
 * 
 * @param {}
 *            info
 * @param {}
 *            tab
 */
function subTitleEditClick(info, tab) {
	log("subTitleEditClick");
	var msg = getMsg(info, tab);
	g_msg = msg;
	var s = screen;
	var prop = "toolbar=0,status=0,resizable=0,width=240,height=230,left="
			+ (s.width - 440) / 2 + ",top=" + (s.height - 430) / 2;
	var top = (s.height - 430) / 2;
	var left = (s.width - 440) / 2;
	var width = 300;
	var height= 250;

	chrome.windows.create({
				top : top,
				left : left,
				width : width,
				height : height,
				url : "../popup.html",
				type : "popup"
			}, function(window) {
			});
}
function initData(tab) {
	g_data = {
		id : tab.id,
		url : tab.url,
		title : tab.title,
		shortenedUrl : "",
		txtContent : ""
	};
	log(g_data);
}

function initPopupMsg() {
	return g_msg;
}
function subTitleSendClick(info, tab) {
	log("subTitleSendClick");
	var msg = getMsg(info, tab);
	g_msg = msg;
	
	sendMsg(msg);
}

function getMsg(info, tab) {
	log(JSON.stringify(info));
	log(JSON.stringify(tab));

	var media = info.mediaType;
	var text = info.selectionText;
	var link = info.linkUrl;
	if (text) {
		return selectionClick(info, tab);
	} else if (media) {
		return mediaClick(info, tab);
	} else if (link) {
		return linkClick(info, tab);
	} else {
		return pageClick(info, tab);
	}
}
function mediaClick(info, tab) {
	log("media click.");

	var msg = chrome.i18n.getMessage("share") + ":" + info.srcUrl + " ";

	return msg;
}
function linkClick(info, tab) {
	log("link click.");

	var msg = chrome.i18n.getMessage("share") + ":" + info.linkUrl + " ";

	return msg;
}

function selectionClick(info, tab) {
	log("selection click.");

	var text = info.selectionText;
	if (text.length > 140) {
		text = text.substr(0, 130) + ".....";
	}

	return text;
}
function pageClick(info, tab) {
	log("page click.");

	var title = tab.title || "";
	var purl = tab.url || "";

	var msg = title + " - " + purl + " ";

	return msg;

}

/**
 * twitter需要把消息中的http去掉。
 * 
 * @param {}
 *            url
 * @return {String}
 */
function rPro(url) {
	if (url == null || url == "") {
		return "";
	}
	return url.replace("http://", "").replace("https://", "");
}

function sendMsg(msgObj) {

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

	log('allServices: ' + JSON.stringify(allServices));
	
	for (var service in allServices) {
		if (allServices[service]) {
			log('service:' + service);
			
			switch (service) {
				case "sina" :
					SinaApi.update(getMeg4send(msgObj, "sina"), sendCallback);
					break;
				case "twitter" :
					TwitterApi.update(getMeg4send(msgObj, "twitter"),
							sendCallback);
					break;
				case "follow5" :
					Follow5Api.update(getMeg4send(msgObj, "follow5"),
							sendCallback);
					break;
				case "sohu" :
					SohuApi.update(getMeg4send(msgObj, "sohu"), sendCallback);
					break;
				case "net163" :
					var token = Util.getObjData("accessToken")['net163'];
					Net163Api.update(getMeg4send(msgObj, "net163"),token,
							sendCallback);
					break;
				case "qq" :
					var token = Util.getObjData("accessToken")['qq'];
					QQApi.update(getMeg4send(msgObj, "qq"),token,
							sendCallback);
					break;
			}
		}
	}
	
	g_msg = "";

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
function getMeg4send(msgObj, /* String */serverType) {
	var msg = msgObj;
	if (serverType == "twitter" || serverType == "sohu") {
		msg = encodeURIComponent(rPro(msgObj));
	}

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
			return shortenUrlByGoogl(url);
			break;
		default :
			return shortenUrlByIsgd(url);
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