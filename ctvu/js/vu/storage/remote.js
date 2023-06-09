vu.storage.remote = {
	_set: function(key, opts, prop, cb) {
		vu.core.z({
			action: "opts",
			key: key,
			opts: opts,
			prop: prop || "opts"
		}, cb);
	},
	setOpts: function(key, opts, cb) {
		vu.storage._set(key, opts, null, cb);
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
	_basics: ["person", "people", "room", "rooms"],
	get: function(ent_type) {
		var vc = vu.core, vcu = vc._udata,
			vs = vu.storage, ex = vs._extras;
		if (vcu && vs._basics.includes(ent_type))
			return vcu[ent_type];
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
		var k, j, item, items, rcount = 2; // more requests..
		vu.core.z({ action: "things" }, function(extras) {
			items = {};
			for (k in extras) {
				for (j in extras[k]) {
					item = extras[k][j];
					CT.data.add(item);
					if (k == "held" || k.startsWith("worn_"))
						items[j] = item;
				}
			}
			extras.items = items;
			vu.storage._extras = extras;
			vu.storage._ready(cb, rcount)();
		});
		vu.core.udata(vu.storage._ready(cb, rcount), allrooms);
	}
};