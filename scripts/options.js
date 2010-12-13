var oauth=ChromeExOAuth.initBackgroundPage({
	'request_url': "http://api.t.163.com/oauth/request_token",
	'authorize_url': "http://api.t.163.com/oauth/authenticate",
	'access_url': "http://api.t.163.com/oauth/access_token",
	'consumer_key':"nvEarTz6ESkybgKq",
	'consumer_secret': "LKDLe4P6G6GulqNOHwwvRdz3LopqG3Vj",
	'scope':'',
	'app_name': "分享吧"
});
function getOauth(servType){
	if (!oauth.hasToken()) {
		oauth.authorize(function() {
					alert('oauth 163 ok.');
				});
	} else {
		alert('already oauth.' + oauth.getToken());
	}
	
	
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
	var srv = "<a class='bindmsg bindmsg-"+type+"'>"+allUserData[type].loginName + "</a><a href='#' onclick=\"remove('" + type + "')\">"+chrome.i18n.getMessage("removeBind");
	$(".alreadyServices ul").append("<li class='"+type+"'>" + srv + "</li>");
}

function remove(type) {
	//var c = ".alreadyServices li:contains('" + type + "')";
	$(".alreadyServices").find("."+type).remove();
	//$(c).remove();
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