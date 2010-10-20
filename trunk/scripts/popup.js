function pushAll() {
	var user = Util.getObjData("allUserData")['sina'];
	
	var content = $('#txtContent').val();
	content = encodeURIComponent(content.replace("http://", ""));

	var allServices = Util.getObjData("alreadyServices");
	var noServices = true;
	for (var i in allServices) {
		if(allServices[i]){
			noServices = false;
			break;
		}
	}
	if (noServices) {
		appendMsg("请先绑定微博");
		return false;
	}

	for (var service in allServices) {
		if (allServices[service]) {
			switch (service) {
				case "sina" :
					SinaApi.update(content, sinaCallBack);
					break;
				case "twitter" :
					TwitterApi.update(content, twtCallBack);
					break;
			}
		}
	}

	return;
}

function twtCallBack(json) {
	var msg = "twitter:";
	if(json.ok){
		msg+="ok";
	}else{
		msg+=json.error;
	}
	clearMsg();
	appendMsg(msg);
}

function sinaCallBack(json) {
	var msg = "sina:";
	if(json.ok){
		msg+="ok";
	}else{
		msg+=json.error;
	}
	clearMsg();
	appendMsg(msg);
}

function createServiceIcon(service) {
	var iconHtml = "";

	iconHtml += '<a class="ui-button button-share button-share-plain"';
	iconHtml += ' href="javascript:openShareWindow(' + "'" + service + "'"
			+ ');"';

	if (g_preferences.parameters.show_icon)
		iconHtml += ' title="' + g_preferences.serviceNames[service]
				+ '"><img class="icon-share" src="icons/' + service + '.png">';
	else
		iconHtml += ">" + g_preferences.serviceNames[service];

	iconHtml += '</a>';

	return iconHtml;
}

function copyToClipboard(content) {
	chrome.extension.sendRequest({
				type : REQUEST_COPY,
				content : content
			});

	if (!g_preferences.parameters.auto_copy)
		window.close();
}

function initData(tab) {
	g_data = {
		id : tab.id,
		url : tab.url,
		title : tab.title,
		shortenedUrl : "",
		txtContent : ""
	}
}
function init() {
	if (!Util.getObjData("alreadyServices")) {
		chrome.tabs.create({
					url : 'options.html'
				});
		return false;
	}

	chrome.tabs.getSelected(null, function(tab) {
				initData(tab);

				if (tab.url.indexOf("http") == 0) {
					var response = chrome.extension.getBackgroundPage()
							.shortenUrl(g_data.url);
					if (response.status == "success") {
						g_data.shortenedUrl = response.message;
					}
				}

				g_data.txtContent = g_data.title + ": " + g_data.shortenedUrl;

				$('#txtContent').append(g_data.txtContent);
				onTextChange();

				$('#divResponse').show();
				$('#divLoading').remove();
			});
}
function appendMsg(msg) {
	var h = $("#divStatus").html();
	$("#divStatus").html(h+ msg);
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