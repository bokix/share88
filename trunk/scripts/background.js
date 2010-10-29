/**
 * @include "Result.js"
 */

var doneServices = [];
var allServicesLength = 0;

function background(){
	var title = chrome.i18n.getMessage("extName");
	chrome.contextMenus.create({"title": title, "contexts":["selection"],
                                       "onclick": selectionOnClick});
//	chrome.contextMenus.create({"title": title, "contexts":["image"],
//                                       "onclick": imageOnClick});
	
}
function imageOnClick(info,tab){
	log("--------------imageOnClick--------------");
	log(JSON.stringify(info));
	log(JSON.stringify(tab));
	
	sendMsg(info.srcUrl);
}
function selectionOnClick(info, tab){
	log("--------------selectionOnClick--------------");
	log(JSON.stringify(info));
	log(JSON.stringify(tab));
	
	var text = info.selectionText;
	var link = info.linkUrl;
	
	text = encodeURIComponent(text.replace("http://", ""));
	sendMsg(text);
	
}
function sendMsg(content){
	doneServices = [];
	var allServices = Util.getObjData("alreadyServices");
	
	log(JSON.stringify(allServices));
	
	var sumServ = 0;
	for (var i in allServices) {
		if(allServices[i]){
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
	chrome.browserAction.setBadgeText({text:"0/"+allServicesLength});
	chrome.browserAction.setBadgeBackgroundColor({color:[255,215,0,255]});
	
	for (var service in allServices) {
		if (allServices[service]) {
			switch (service) {
				case "sina" :
					SinaApi.update(content, sendCallback);
					break;
				case "twitter" :
					TwitterApi.update(content, sendCallback);
					break;
			}
		}
	}

	return;
}

function sendCallback(/*Result*/result) {
	
	log("send call bacl execute...");
	log(result);
	log("-------------------------");
	
	
	doneServices[doneServices.length] = result;
	
	log(doneServices);
	
	if(doneServices.length==allServicesLength){ //all task done.
		
		var sumError = 0;
		for(var i in doneServices){
			if(!doneServices[i].ok){
				sumError++;
			}
		}
		if(sumError == 0){ // all ok.
			chrome.browserAction.setBadgeText({text:allServicesLength+"/"+allServicesLength});
	    	chrome.browserAction.setBadgeBackgroundColor({color:[0,255,0,255]});
		}else{ // some task error.
			chrome.browserAction.setBadgeText({text:(allServicesLength-sumError)+"/"+allServicesLength});
	    	chrome.browserAction.setBadgeBackgroundColor({color:[255,0,0,255]});
		}
	}else{
		chrome.browserAction.setBadgeText({text:doneServices.length+"/"+allServicesLength});
	    chrome.browserAction.setBadgeBackgroundColor({color:[255,215,0,255]});
	}
	
}


function shortenUrl(url)
{
	
	var shortenService = Util.getData('shortServices');
	
	switch(shortenService)
	{
		case "is.gd":
			return shortenUrlByIsgd(url);
			break;
		case "aa.cx":
			return shortenUrlByAacx(url);
			break;
		case "goo.gl":
		default:
			return shortenUrlByGoogl(url);
			break;
	}
}

function shortenUrlByGoogl(url)
{
	var response;
	
	var	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "http://goo.gl/api/url?user=toolbar@google.com&url=" + encodeURIComponent(url) + "&auth_token=" + getAuthToken(url), false);
	xmlhttp.onload = function()
	{
		var object = JSON.parse(xmlhttp.responseText);
		
		if(object["short_url"] == undefined)
			response = {status: "error", message: object["error_message"]};
		else	
			response = {status: "success", message: object["short_url"]};
	};
	xmlhttp.send(null);
 
	return response;
}

function shortenUrlByIsgd(url)
{
	var response;
	var	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "http://is.gd/api.php?longurl=" + encodeURIComponent(url), false);
	xmlhttp.onload = function()
	{
		if(200 == xmlhttp.status)	
			response = {status: "success", message: xmlhttp.responseText};
		else	
			response = {status: "error", message: "Internal server error!"};
	};
	xmlhttp.send(null);
 
	return response;	
}

function shortenUrlByAacx(url)
{
	var response;
	var	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "http://aa.cx/api.php?url=" + encodeURIComponent(url), false);
	xmlhttp.onload = function()
	{
		if(200 == xmlhttp.status)	
			response = {status: "success", message: xmlhttp.responseText};
		else	
			response = {status: "error", message: "Internal server error!"};
	};
	xmlhttp.send(null);
 
	return response;	
}

function log(o){
	console.log(o);
}