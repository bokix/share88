/**
 * depends Base64.js
 * 
 * @type
 */
var Util = {
	getObjData : function(key) {
		return JSON.parse(this.getData(key));
	},
	getData : function(key) {
		return localStorage.getItem(key);
	},
	saveData : function(key, value) {
		localStorage.removeItem(key);
		localStorage.setItem(key, value);
	},
	getByteLength : function(str) {
		var byteLength = str.length;
		var i = 0;
		for (i = 0; i < str.length; i++) {
			if (str.charCodeAt(i) > 255) {
				byteLength++;
			}
		}
		return byteLength;
	},
	parseResponseText : function(s) {
		// "oauth_token=1ca4afc8058259aedc0d6f8a263e270e&oauth_token_secret=cad682778669f0a59c3333b12bac83a6";
		var sArr = s.split("&");

		var obj = {};
		for (var i in sArr) {
			var s1 = sArr[i];
			obj[s1.substring(0, s1.indexOf("="))] = s1.substring(s1
							.indexOf("=")
							+ 1, s1.length);
		}

		// log('after parse response:' + JSON.stringify(obj));

		return obj;
	},
	makeBasicAuth : function(key, value) {
		var tok = key + ':' + value;
		var hash = Base64.encode(tok);
		return "Basic " + hash;
	}

};
