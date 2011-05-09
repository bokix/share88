/**
 * @include "util.js"
 */

function oauth(type) {
	switch (type) {
		case 'net163' :
			oauthStart(".net163Div .msg");
			Net163Api.authenticate(function(/* Result */result) {
						oauthEnd(".net163Div .msg");
						if (!result.ok) {
							$(".net163Div .msg").empty()
									.html(result.responseText);
						}
					});
			break;
		case 'qq' :
			oauthStart(".qqDiv .msg");
			QQApi.authenticate(function(/* Result */result) {
						oauthEnd(".qqDiv .msg");
						if (!result.ok) {
							$(".qqDiv .msg").empty().html(result.responseText);
						}

					});
			break;
		case 'sina' :
			oauthStart(".sinaDiv .msg");
			var key = $(".js_sinaAppkey").val();
			var secret = $(".js_sinaSecret").val();
			SinaApi.authenticate(key,secret,function(/* Result */result) {
						oauthEnd(".sinaDiv .msg");
						if (!result.ok) {
							$(".sinaDiv .msg").empty().html(result.responseText);
						}

					});
			break;	
		default :
			break;
	}
}
function savePin(type) {
	switch (type) {
		case 'net163' :
			oauthStart(".net163Div .msg");
			Net163Api.getAccessToken(function(/* Result */result) {
						oauthEnd(".net163Div .msg");
						if (!result.ok) {
							$(".net163Div .msg").empty()
									.html(result.responseText);
						} else {
							oauthCallBack(result);
						}
					});
			break;
		case 'qq' :
			oauthStart(".qqDiv .msg");
			var pin = $.trim($(".qqDiv input[name=pin]").val());

			if (pin == "") {
				oauthEnd(".qqDiv .msg");
				$(".qqDiv .msg").empty().html("请输入授权码");
				return false;
			}
			QQApi.getAccessToken($.trim(pin), function(/* Result */result) {
						oauthEnd(".qqDiv .msg");
						if (!result.ok) {
							$(".qqDiv .msg").empty().html(result.responseText);
						} else {
							oauthCallBack(result);
						}

					});
			break;
		case 'sina' :
			oauthStart(".sinaDiv .msg");
			var pin = $.trim($(".sinaDiv input[name=pin]").val());

			if (pin == "") {
				oauthEnd(".sinaDiv .msg");
				$(".sinaDiv .msg").empty().html("请输入授权码");
				return false;
			}
			SinaApi.getAccessToken($.trim(pin), function(/* Result */result) {
						oauthEnd(".sinaDiv .msg");
						if (!result.ok) {
							$(".sinaDiv .msg").empty().html(result.responseText);
						} else {
							oauthCallBack(result);
						}

					});
			break;	
	}
}
function oauthStart(className) {
	var v = "<img src='../icons/ajax-loader.gif'></img>";
	$(className).html(v);

}
function oauthEnd(className) {
	$(className).empty();
}

function oauthCallBack(/* Result */r) {
	log(r);
	if (!r.ok) {
		log('error.' + r.responseText);
		return;
	}
	$('.inputdiv').hide();

	var accessToken = Util.getObjData("accessToken") || {};
	accessToken[r.srvName] = r.data;

	log('accessToken:' + JSON.stringify(accessToken));

	Util.saveData("accessToken", JSON.stringify(accessToken));

	var allUserData = Util.getObjData("allUserData") || {};
	allUserData[r.srvName] = {};
	allUserData[r.srvName].loginName = r.data.name  || r.data.user_id || "";

	log("allUserData[" + r.srvName + "]:"
			+ JSON.stringify(allUserData[r.srvName]));

	Util.saveData("allUserData", JSON.stringify(allUserData));

	save(r.srvName);
}

function showInputDiv(type) {
	var c = "." + type + "Div";
	$(c).show();
	var vi = c + " input:first";
	$(vi).focus();
}

/**
 * 不需要oauth验证的，保存页面form
 * 
 * @param {}
 *            type
 */
function saveForm(type) {
	$(".inputdiv").hide();
	var inputClsKey = "." + type + "Input"; // like: ".sinaInput"
	var allUserData = Util.getObjData("allUserData") || {};
	allUserData[type] = {};
	$(inputClsKey).each(function() {
				allUserData[type][this.name] = this.value;
			});

	log('allUserData:' + JSON.stringify(allUserData));

	Util.saveData("allUserData", JSON.stringify(allUserData));

	save(type);
}

function save(type) {
	log('save...');

	var allServices = Util.getObjData("alreadyServices") || {};
	allServices[type] = true;

	log('alreadyServices:' + JSON.stringify(allServices));

	Util.saveData("alreadyServices", JSON.stringify(allServices));

	showServices(type);
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
	var accessToken = Util.getObjData("accessToken") || {};

	delete accessToken[type];
	delete allServices[type];
	delete allUserData[type];

	Util.saveData("accessToken", JSON.stringify(accessToken));
	Util.saveData("alreadyServices", JSON.stringify(allServices));
	Util.saveData("allUserData", JSON.stringify(allUserData));

	log("accessToken:" + JSON.stringify(accessToken));
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
	if(config_showTwitter){
		$(".config_showTwitter").removeClass("config_showTwitter");
	}
}

function log(msg) {
	System.Debug.outputString(msg);
}