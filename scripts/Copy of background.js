var doneServices = [];
var allServicesLength = 0;
function background() {
	var a = chrome.i18n.getMessage("extName");
	chrome.contextMenus.create({
				title : a,
				contexts : ["selection"],
				onclick : selectionOnClick
			})
}
function imageOnClick(b, a) {
	console.log("--------------imageOnClick--------------");
	console.log(JSON.stringify(b));
	console.log(JSON.stringify(a));
	sendMsg(b.srcUrl)
}
function selectionOnClick(c, a) {
	console.log("--------------selectionOnClick--------------");
	console.log(JSON.stringify(c));
	console.log(JSON.stringify(a));
	var d = c.selectionText;
	var b = c.linkUrl;
	d = encodeURIComponent(d.replace("http://", ""));
	sendMsg(d)
}
function sendMsg(e) {
	chrome.browserAction.setBadgeText({
				text : ""
			});
	chrome.browserAction.setBadgeBackgroundColor({
				color : [0, 0, 0, 0]
			});
	doneServices = [];
	var b = Util.getObjData("alreadyServices");
	log(JSON.stringify(b));
	var c = 0;
	for (var d in b) {
		if (b[d]) {
			c++
		}
	}
	if (c == 0) {
		chrome.tabs.create({
					url : "options.html"
				});
		return false
	}
	allServicesLength = c;
	for (var a in b) {
		if (b[a]) {
			switch (a) {
				case "sina" :
					SinaApi.update(e, sendCallback);
					break;
				case "twitter" :
					TwitterApi.update(e, sendCallback);
					break
			}
		}
	}
	return
}
function sendCallback(a) {
	doneServices[doneServices.length] = a;
	log(doneServices);
	if (doneServices.length == allServicesLength) {
		var b = 0;
		for (var c in doneServices) {
			if (!doneServices[c].ok) {
				b++
			}
		}
		if (b == 0) {
			chrome.browserAction.setBadgeText({
						text : allServicesLength + "/" + allServicesLength
					});
			chrome.browserAction.setBadgeBackgroundColor({
						color : [0, 255, 0, 255]
					})
		} else {
			chrome.browserAction.setBadgeText({
						text : (allServicesLength - b) + "/"
								+ allServicesLength
					});
			chrome.browserAction.setBadgeBackgroundColor({
						color : [255, 0, 0, 255]
					})
		}
	} else {
		chrome.browserAction.setBadgeText({
					text : doneServices.length + "/" + allServicesLength
				});
		chrome.browserAction.setBadgeBackgroundColor({
					color : [255, 215, 0, 255]
				})
	}
}
function shortenUrl(b) {
	var a = Util.getData("shortServices");
	switch (a) {
		case "is.gd" :
			return shortenUrlByIsgd(b);
			break;
		case "aa.cx" :
			return shortenUrlByAacx(b);
			break;
		case "goo.gl" :
		default :
			return shortenUrlByGoogl(b);
			break
	}
}
function shortenUrlByGoogl(b) {
	var a;
	var c = new XMLHttpRequest();
	c.open("POST", "http://goo.gl/api/url?user=toolbar@google.com&url="
					+ encodeURIComponent(b) + "&auth_token=" + getAuthToken(b),
			false);
	c.onload = function() {
		var d = JSON.parse(c.responseText);
		if (d.short_url == undefined) {
			a = {
				status : "error",
				message : d.error_message
			}
		} else {
			a = {
				status : "success",
				message : d.short_url
			}
		}
	};
	c.send(null);
	return a
}
function shortenUrlByIsgd(b) {
	var a;
	var c = new XMLHttpRequest();
	c.open("GET", "http://is.gd/api.php?longurl=" + encodeURIComponent(b),
			false);
	c.onload = function() {
		if (200 == c.status) {
			a = {
				status : "success",
				message : c.responseText
			}
		} else {
			a = {
				status : "error",
				message : "Internal server error!"
			}
		}
	};
	c.send(null);
	return a
}
function shortenUrlByAacx(b) {
	var a;
	var c = new XMLHttpRequest();
	c.open("GET", "http://aa.cx/api.php?url=" + encodeURIComponent(b), false);
	c.onload = function() {
		if (200 == c.status) {
			a = {
				status : "success",
				message : c.responseText
			}
		} else {
			a = {
				status : "error",
				message : "Internal server error!"
			}
		}
	};
	c.send(null);
	return a
}
function log(a) {
	console.log(a)
};