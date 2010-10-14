var g_preferences = new Preferences;
var g_data;

function addServices() {
	var hasButton = false;

	if (g_preferences.services != undefined) {
		var hasButton = false;
		var $divShare = $('#divShare');
		if (null == $divShare)
			return false;

		// create services button
		for (var service in g_preferences.services) {
			if (g_preferences.services[service]) {
				$divShare.append(createServiceIcon(service));
				hasButton = true;
			}
		}

		// create copy button
		if (!g_preferences.parameters.auto_copy) {
			var temp = '<a href="#" class="ui-button button-share button-share-plain"';

			if (g_preferences.parameters.show_icon)
				temp += ' title="拷贝到剪贴板"><img class="icon-share" src="icons/copy.png">';
			else
				temp += '>拷贝到剪贴板';

			temp += '</a>';

			$divShare.append(temp);
			hasButton = true;
		}

		if (hasButton) {
			$divShare.show();
		} else {
			$divShare.hide();
		}

	}

	return hasButton;
}

function addServicesAdv() {
	var $divShareAdv = $('#divShareAdv');
	if (null == $divShareAdv)
		return false;

	// if(g_preferences.twitter.enabled)
	// {
	var temp = '<a class="ui-button ui-state-default button-share-advance"';
	temp += ' id="btnTwitter" href="javascript:pushAll();">';
	temp += '<img src="icons/twitter.png"> send</a>';
	$divShareAdv.append(temp);
	$divShareAdv.show();
	return true;
	// }
	// else
	// {
	$divShareAdv.hide();
	return false;
	// }
}

function pushAll() {
	var content = g_data.txtContent;
	content = encodeURIComponent(content.replace("http://", ""));
	
	var allServices = Util.getObjData("alreadyServices");
	if(!allServices){
		alert("请先设置");
		return;
	}
	var sum = 0;
	for(var i in allServices){
		sum++;
		break;
	}
	if(sum==0){
		alert("请先设置");
		return;
		
	}
	
	for (var service in allServices) {
		
		if (allServices[service]) {
			alert(service);
			switch (service) {
				case "sina" :
					SinaApi.update(content,sinaCallBack);
					break;
				case "twitter" :
					TwitterApi.update(content,twtCallBack);
					break;
			}
		}
	}

	return;
}

function twtCallBack(){
	alert('twitter call back');
	
	
}

function sinaCallBack(){
	alert('sina call back');
	
	
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
	$(document).ready(function() {
				$('#divResponse').hide();
			});

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

				// Adding share buttons
				var hasButton = addServices();
				if (hasButton) {
					$(".button-share").hover(function() {
						$(this).removeClass("button-share-plain")
								.addClass("ui-state-hover");
					}, function() {
						$(this).removeClass("ui-state-hover")
								.addClass("button-share-plain");
					});
				}
				var hasAdvButton = addServicesAdv();
				if (hasButton) {
					$(".button-share-advance").hover(function() {
								$(this).addClass("ui-state-hover");
							}, function() {
								$(this).removeClass("ui-state-hover");
							});
				}

				$('#divResponse').show();
				$('#divLoading').remove();
			});
}

function onTextChange() {
	g_data.txtContent = $('#txtContent').attr("value");
	if (g_preferences.parameters.auto_copy)
		copyToClipboard(g_data.txtContent);
}