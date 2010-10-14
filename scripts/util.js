/**
 * depends Base64.js
 * 
 * @type
 */
var Util = {
	getObjData : function(key) {
		return JSON.parse(this.getData(key));
	},
	getData : function (key){
		return localStorage.getItem(key);
	},
	saveData : function(key, value) {
		localStorage.removeItem(key);
		localStorage.setItem(key,value);
	},
	makeBasicAuth : function(key, value) {
		var tok = key + ':' + value;
		var hash = Base64.encode(tok);
		return "Basic " + hash;
	}

};
