vu.storage.local = {
	save: function(obj, cb, key) {
		CT.storage.set(key || obj.key, obj);
		cb && cb();
	},
	get: function(key) {
		return CT.storage.get(key);
	},
	init: function(cb) {
		cb();
	}
};