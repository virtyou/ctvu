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
			exporter: "json",
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
			if (sub == "head")
				ent = ent.body.parts[0];
			else if (sub)
				ent = ent[sub];
		}
		obj.key = ent.key;
		vu.storage.edit(obj, cb);
	},
	has: function(ent_type) {
		return !!(vu.core._udata[ent_type] || vu.storage._extras[ent_type]);
	},
	get: function(ent_type) {
		var vc = vu.core, vcu = vc._udata,
			ex = vu.storage._extras;
		if (vcu) {
			if (ent_type == "person")
				return vcu.person;
			else if (ent_type == "people")
				return vcu.people;
			else if (ent_type == "room")
				return vcu.room;
			else if (ent_type == "rooms")
				return vcu.rooms;
		}
		if (ent_type == "allrooms")
			return vc._allrooms;
		else if (ex && ent_type in ex)
			return ex[ent_type];
//		return CT.db.get(key);
		CT.log("vu.storage.get() unable to find: " + ent_type);
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