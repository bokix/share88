/**
 * @include "Result.js"
 * @type String
 */

var gCleantimeoutId = "";//全局timeout函数句柄
var doneServices = [];
var allServicesLength = 0;
var currentSimpleChar = true;//当前是简体字

/**
 * shorten url.
 */
function chgURL() {
	clearLogMsg();
	showLoading();
	
	var /*string*/content = $('#txtContent').val();
	if (content == "") {
		hideLoading();
		return;
	}
	var txtObj = document.getElementById("txtContent");
	var urlReg = /[hH][tT][tT][pP][sS]?:\/\/[^\s]*/g;
	var tmp = content;
	var urlArr = content.match(urlReg);
	if (urlArr && urlArr.length > 0) {

		for (var i = 0; i < urlArr.length; i++) {
			var source = urlArr[i];
			
			setLogMsg("shorten: " + source);
			
			var response = shortenUrl(source);
			
			if (response.status == "success") {
				tmp = tmp.replace(source,response.message);
			} else {
				setLogMsg("short url error.");
			}
		}
		$('#txtContent').val(tmp);
		onTextChange();
	} else {
	}
	hideLoading();
	delayClearMsg();
}

/**
 * 字符繁体化
 */
function traditionalized(){
	var content = $('#txtContent').val();
	if(currentSimpleChar){
		$('#txtContent').val(content.Traditionalized());
		currentSimpleChar = false;
	}else{
		$('#txtContent').val(content.Simplized());
		currentSimpleChar = true;
	}
}
function init() {
	System.Gadget.settingsUI="options.html";
}


/**
 * twitter需要把消息中的http去掉。
 * 
 * @param {}
 *            url
 * @return {String}
 */
function rPro(url) {
	if (url == null || url == "") {
		return "";
	}
	return url.replace("http://", "").replace("https://", "");
}

function sendMsg() {

	var msgObj = $('#txtContent').val();
	if(msgObj == ""){
		return;
	}
	
	showLoading();
	
	var allServices = Util.getObjData("alreadyServices");

	var sumServ = 0;
	for (var i in allServices) {
		if (allServices[i]) {
			sumServ++;
		}
	}

	if (sumServ == 0) {
		setLogMsg("没有配置服务，请先进行配置。");
		hideLoading();
		delayClearMsg();
		
		return false;
	}
	
	allServicesLength = sumServ;
	doneServices = new Array();
	
	for (var service in allServices) {
		if (allServices[service]) {
			
			setLogMsg("send to " + service + " ...");

			switch (service) {
				case "sina" :
					SinaApi.update(getMeg4send(msgObj, "sina"), sendCallback);
					break;
				case "twitter" :
					TwitterApi.update(getMeg4send(msgObj, "twitter"),
							sendCallback);
					break;
				case "follow5" :
					Follow5Api.update(getMeg4send(msgObj, "follow5"),
							sendCallback);
					break;
				case "sohu" :
					SohuApi.update(getMeg4send(msgObj, "sohu"), sendCallback);
					break;
				case "net163" :
					var token = Util.getObjData("accessToken")['net163'];
					Net163Api.update(getMeg4send(msgObj, "net163"),token,
							sendCallback);
					break;
				case "qq" :
					var token = Util.getObjData("accessToken")['qq'];
					QQApi.update(getMeg4send(msgObj, "qq"),token,
							sendCallback);
					break;
			}
		}
	}

	return;
}

/**
 * 不同服务器对于发送的消息要求不同，如：新浪对于发送的内容不允许有除新浪自己以外的短网址！！
 * 
 * @param {}
 *            msgObj
 * @param {}
 *            serverType
 */
function getMeg4send(msgObj, /* String */serverType) {
	var msg = msgObj;
	if (serverType == "twitter" || serverType == "sohu") {
		msg = encodeURIComponent(rPro(msgObj));
	}

	return msg;
}

function sendCallback(/* Result */result) {
	clearLogMsg();
	
	log("call back result:" + JSON.stringify(result));
	
	doneServices[doneServices.length] = result;
	
	var msg = "send " + result.srvName +" ";
	if(result.ok){
		msg += "success.";
	}else{
		msg += "failed."+result.responseText;
	}
	setLogMsg(msg);
	
	if (doneServices.length >= allServicesLength) { // all task done.
		hideLoading();
		delayClearMsg();
	}
}

function shortenUrl(url) {

	var shortenService = Util.getData('shortServices');

	switch (shortenService) {
		case "is.gd" :
			return shortenUrlByIsgd(url);
			break;
		case "aa.cx" :
			return shortenUrlByAacx(url);
			break;
		case "goo.gl" :
			return shortenUrlByGoogl(url);
			break;
		default :
			return shortenUrlByIsgd(url);
			break;
	}
}

function shortenUrlByGoogl(url) {
	var response;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "http://goo.gl/api/url?user=toolbar@google.com&url="
					+ encodeURIComponent(url) + "&auth_token="
					+ getAuthToken(url), false);
	xmlhttp.onload = function() {
		var object = JSON.parse(xmlhttp.responseText);

		if (object["short_url"] == undefined)
			response = {
				status : "error",
				message : object["error_message"]
			};
		else
			response = {
				status : "success",
				message : object["short_url"]
			};
	};
	xmlhttp.send(null);

	return response;
}

function shortenUrlByIsgd(url) {

	var response = {};
	var u = "http://is.gd/api.php?longurl=" + encodeURIComponent(url);
	$.ajax({
				type : "GET",
				url : u,
				async : false,
				cache : false,
				// data:{i:Math.random()},
				success : function(data, textStatus) {
					response = {
						status : "success",
						message : data
					};
				},
				error : function(xhr, textStatus, errorThrown) {
					response = {
						status : "error",
						message : "Internal server error!"
					};
				},
				timeout : 30000
			});

	return response;
}

function shortenUrlByAacx(url) {
	var response = {};
	var u = "http://aa.cx/api.php?url=" + encodeURIComponent(url);
	$.ajax({
				type : "GET",
				url : u,
				async : false,
				cache : false,
				// data:{i:Math.random()},
				success : function(data, textStatus) {
					response = {
						status : "success",
						message : data
					};
				},
				error : function(xhr, textStatus, errorThrown) {
					response = {
						status : "error",
						message : "Internal server error!"
					};
				},
				timeout : 30000
			});
	return response;
}

function showLoading(){
	$(".loadingdiv").addClass("loadingdiv-show");
}
function hideLoading(){
	$(".loadingdiv").removeClass("loadingdiv-show");
}
function clearTxt(){
	$("#txtContent").val("");
	onTextChange();
}
function log(msg){
	System.Debug.outputString(msg);
}
function delayClearMsg(){
	clearTimeout(gCleantimeoutId);
	gCleantimeoutId = setTimeout(clearLogMsg,2000);
}
function setLogMsg(msg) {
	$(".logdiv").html(msg).show();
}
function clearLogMsg() {
	$(".logdiv").html("").hide();
	clearTimeout(gCleantimeoutId);
}
function onTextChange() {
	var v = $('#txtContent').val();
	var lenZh = v.length;
	var lenEn = Util.getByteLength(v);
	$(".msgCountZh").html(lenZh + "/140");
	$(".msgCountEn").html(lenEn + "/140");
}