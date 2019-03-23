vu.storage.remote = {
	_set: function(key, opts, prop) {
		vu.core.z({
			action: "opts",
			key: key,
			opts: opts,
			prop: prop || "opts"
		});
	},
	setOpts: function(key, opts) {
		vu.storage._set(key, opts);
	},
	setMaterial: function(key, opts) {
		vu.storage._set(key, opts, "material");
	},
	edit: function(data, cb, action, pname) {
		var params = {
			action: action || "edit",
			pw: core.config.ctvu.storage.apikey
		};
		params[pname || "data"] = data;
		CT.net.post({
			path: "/_db",
			params: params,
			cb: cb
		});
	},
	save: function(full, cb, ent_type, obj, sub, ent) {
		var udata = vu.core._udata;
		if (!ent) {
			if (ent_type == "person")
				ent = udata.person;
			else if (ent_type == "room")
				ent = udata.room;
			if (sub)
				ent = ent[sub];
		}
		obj.key = ent.key;
		vu.storage.edit(obj, cb);
	},
	get: function(ent_type) {
		if (ent_type == "person")
			return vu.core._udata.person;
		else if (ent_type == "room")
			return vu.core._udata.room;
		else if (ent_type == "rooms")
			return vu.core._udata.rooms;
		else if (ent_type == "allrooms")
			return vu.core._allrooms;
		else if (ent_type in vu.storage._extras)
			return vu.storage._extras[ent_type];
		return CT.db.get(key);
	},
	_readys: 0,
	_ready: function(cb, rcount) {
		return function() {
			vu.storage._readys += 1;
			if (vu.storage._readys == rcount)
				cb(vu.core._udata);
		};
	},
	init: function(cb, allrooms) {
		var rcount = 2; // for possible additional requests....
		vu.core.z({ action: "things" }, function(extras) {
			for (var k in extras)
				for (var j in extras[k])
					CT.data.add(extras[k][j]);
			vu.storage._extras = extras;
			vu.storage._ready(cb, rcount)();
		});
		vu.core.udata(vu.storage._ready(cb, rcount), allrooms);
	}
};