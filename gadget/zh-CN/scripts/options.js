/**
 * @include "util.js"
 */
/**
 * var oauth=ChromeExOAuth.initBackgroundPage({ 'request_url':
 * "http://api.t.163.com/oauth/request_token", 'authorize_url':
 * "http://api.t.163.com/oauth/authenticate", 'access_url':
 * "http://api.t.163.com/oauth/access_token", 'consumer_key':"nvEarTz6ESkybgKq",
 * 'consumer_secret': "LKDLe4P6G6GulqNOHwwvRdz3LopqG3Vj", 'scope':'',
 * 'app_name': "" });
 */
function getOauth(servType) {
	if (!oauth.hasToken()) {
		oauth.authorize(function() {
					alert('oauth 163 ok.');
				});
	} else {
		alert('already oauth.' + oauth.getToken());
	}
}

function showInputDiv(type) {
	var c = "." + type + "Div";
	$(c).show();
	var vi = c + " input:first";
	log("html:"+$(vi).length + "," + $(vi).attr("name") + ", " + $(vi).attr("className"));
	$(vi).focus();
}
function save(type) {
	$(".inputdiv").hide();
	var inputClsKey = "." + type + "Input"; // like: ".sinaInput"
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
	// var srv = "<a class='bindmsg
	// bindmsg-"+type+"'>"+allUserData[type].loginName + "</a><a
	// href='javascript:remove(\""+type+"\")'>remove</a>";
	var cr = ".bind-" + type + "-row";
	var cn = cr + " .bind-user-name";
	var ca = cr + " .bind-action";

	$(ca).hide("normal", function() {
				$(cn).text(allUserData[type].loginName).show();
			});

	// $(".alreadyServices ul").append("<li class='"+type+"'>" + srv + "</li>");
}

function remove(type) {
	log('remove:' + type);
	var cr = ".bind-" + type + "-row";
	var cn = cr + " .bind-user-name";
	var ca = cr + " .bind-action";

	$(cn).html("").hide("normal", function() {
				$(ca).show();
			});

	// $(".alreadyServices").find("."+type).remove();
	var allServices = Util.getObjData("alreadyServices") || {};
	var allUserData = Util.getObjData("allUserData") || {};

	delete allServices[type];
	delete allUserData[type];

	Util.saveData("alreadyServices", JSON.stringify(allServices));
	Util.saveData("allUserData", JSON.stringify(allUserData));

	log("allServices:" + JSON.stringify(allServices));
	log("allUserData:" + JSON.stringify(allUserData));
}

function onLoadOptionPage() {
	var allServices = Util.getObjData("alreadyServices") || {};
	for (var i in allServices) {
		if (allServices[i]) {
			showServices(i);
		}
	}
}

function log(msg) {
	System.Debug.outputString(msg);
}