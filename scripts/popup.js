function pushAll() {
	/**
	chrome.tabs.getSelected(null, function (tab){
		console.log("tab id:::::::::::::" + JSON.stringify(tab));
		chrome.browserAction.setBadgeText({text:"2/5",tabId:tab.id});
	
	});
	chrome.browserAction.setTitle({title:"<b>dkdkdkd</b>kdkf\nkk<ul><li>1</li><li>2</li></ul>"});
	return;
	*/
	
	window.close();
	var content = $('#txtContent').val();
	var msgObj = new MsgObj();
	msgObj.mediaType = "text";
	msgObj.msg = content;
	chrome.extension.getBackgroundPage().sendMsg(msgObj);

	//return;
}

/**
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
*/
function initData(tab) {
	g_data = {
		id : tab.id,
		url : tab.url,
		title : tab.title,
		shortenedUrl : "",
		txtContent : ""
	};
}
function init() {

	if (!Util.getObjData("alreadyServices")) {
		window.close();
		chrome.tabs.create({
					url : 'options.html'
				});
		return false;
	}

	chrome.tabs.getSelected(null, function(tab) {
				initData(tab);

				/**
				if (tab.url.indexOf("http") == 0) {
					var response = chrome.extension.getBackgroundPage()
							.shortenUrl(g_data.url);
					if (response.status == "success") {
						g_data.shortenedUrl = response.message;
					}
				}
				*/
				g_data.txtContent = g_data.title + ": " + g_data.shortenedUrl;

				$('#txtContent').append(g_data.txtContent);
				onTextChange();

				$('#divResponse').show();
				$('#divLoading').remove();
			});
	initLog();
}
function initLog(){
	clearMsg();
	var doneServices = chrome.extension.getBackgroundPage().getDoneServices();
	if(!doneServices || doneServices.length==0){
		return;
	}
	var msg = "";
	for(var i = 0;i<doneServices.length;i++){
		if(!doneServices[i].ok){
			msg+=doneServices[i].srvName+":"+doneServices[i].responseText;
		}
	}
	if(msg==""){
		return ;
	}
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