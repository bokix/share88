function pushAll() {
	/**
	 * chrome.tabs.getSelected(null, function (tab){ console.log("tab
	 * id:::::::::::::" + JSON.stringify(tab));
	 * chrome.browserAction.setBadgeText({text:"2/5",tabId:tab.id});
	 * 
	 * }); chrome.browserAction.setTitle({title:"<b>dkdkdkd</b>kdkf\nkk
	 * <ul>
	 * <li>1</li>
	 * <li>2</li>
	 * </ul>
	 * "}); return;
	 */

	window.close();
	var content = $('#txtContent').val();
	chrome.extension.getBackgroundPage().sendMsg(content);
	// return;
}

/**
 * shorten url.
 */
function shortenURL() {
	clearMsg();
	var /*string*/content = $('#txtContent').val();
	if (content == "") {
		return;
	}
	var txtObj = document.getElementById("txtContent");
	var urlReg = /[hH][tT][tT][pP][sS]?:\/\/[^\s]*/g;
	var tmp = content;
	var urlArr = content.match(urlReg);
	if (urlArr && urlArr.length > 0) {

		for (var i = 0; i < urlArr.length; i++) {
			var source = urlArr[i];
			var startIndex = content.indexOf(source);
			var endIndex = startIndex + source.length;
			txtObj.setSelectionRange(startIndex,endIndex);
			var response = chrome.extension.getBackgroundPage()
					.shortenUrl(source);
			if (response.status == "success") {
				tmp = tmp.replace(source,response.message);
			} else {
				clearMsg();
				setMsg("short url error.");
			}
		}
		$('#txtContent').val(tmp);
		onTextChange();
	} else {
	}

}

function changeSimpleChar(){
	clearMsg();
	var /*string*/content = $('#txtContent').val();
	if (content == "") {
		return;
	}
	
	chrome.extension.getBackgroundPage().log("msg:" + content);
	
	$("a").toggle(function(){
		chrome.extension.getBackgroundPage().log("Traditionalized:" + content.Traditionalized());
		$('#txtContent').val(content.Traditionalized());
	},function(){
		chrome.extension.getBackgroundPage().log("Simplized:" + content.Simplized());
		$('#txtContent').val(content.Simplized());
	});
}
function init() {
	
	if (!Util.getObjData("alreadyServices")) {
		window.close();
		chrome.tabs.create({
					url : 'options.html'
				});
		return false;
	}

	var msg = chrome.extension.getBackgroundPage().initPopupMsg();

	if (msg == "") {
		chrome.tabs.getSelected(null, function(tab) {
					msg = tab.title + " - " + tab.url;
					$('#txtContent').html(msg);
					onTextChange();
				});
	} else {
		$('#txtContent').html(msg);
		onTextChange();
	}


	$('#divResponse').show();
	$('#divLoading').remove();

	initLog();
	
	$(".simpleChar").toggle(function(){
		var content = $('#txtContent').val();
		chrome.extension.getBackgroundPage().log("Traditionalized:" + content.Traditionalized());
		$('#txtContent').val(content.Traditionalized());
	},function(){
		var content = $('#txtContent').val();
		chrome.extension.getBackgroundPage().log("Simplized:" + content.Simplized());
		$('#txtContent').val(content.Simplized());
	});
}
function initLog() {
	clearMsg();
	var doneServices = chrome.extension.getBackgroundPage().getDoneServices();
	if (!doneServices || doneServices.length == 0) {
		return;
	}
	var msg = "";
	for (var i = 0; i < doneServices.length; i++) {
		if (!doneServices[i].ok) {
			msg += "<br/>" + doneServices[i].srvName + ":" + doneServices[i].responseText;
		}
	}
	if (msg == "") {
		return;
	}
	msg = msg.substring(5,msg.length);
	msg = "发送错误：" + msg;
	console.log("error msg:" + msg);
	setMsg(msg);
}
function setMsg(msg) {
	$("#divStatus").html(msg);
}
function clearMsg() {
	$("#divStatus").empty();
}
function onTextChange() {
	var v = $('#txtContent').val();
	var lenZh = v.length;
	var lenEn = Util.getByteLength(v);
	$(".msgCountZh").html(lenZh + "/140");
	$(".msgCountEn").html(lenEn + "/140");
}