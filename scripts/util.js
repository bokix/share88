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
	makeBasicAuth : function(key, value) {
		var tok = key + ':' + value;
		var hash = Base64.encode(tok);
		return "Basic " + hash;
	}

};
