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
	var srv = "<a class='bindmsg bindmsg-"+type+"'>"+type + "</a><a href='#' onclick=\"remove('" + type + "')\">"+chrome.i18n.getMessage("removeBind");
	$(".alreadyServices ul").append("<li>" + srv + "</li>");
}

function remove(type) {
	var c = ".alreadyServices li:contains('" + type + "')";
	$(c).remove();
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