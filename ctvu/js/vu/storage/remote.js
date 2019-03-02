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
	save: function(full, cb, ent_type, obj, sub) {
		var udata = vu.core._udata, ent;
		if (ent_type == "person")
			ent = udata.people[0];
		else if (ent_type == "room")
			ent = udata.rooms[0];
		if (sub)
			ent = ent[sub];
		obj.key = ent.key;
		vu.storage.edit(obj, cb);
	},
	get: function(ent_type) {
		if (ent_type == "person")
			return vu.core._udata.person;
		else if (ent_type == "room")
			return vu.core._udata.rooms[0];
		else if (ent_type in vu.storage._extras)
			return vu.storage._extras[ent_type];
		return CT.db.get(key);
	},
	init: function(cb) {
		vu.core.z({ action: "things" }, function(extras) {
			for (var k in extras)
				for (var j in extras[k])
					CT.data.add(extras[k][j]);
			vu.storage._extras = extras;
		});
		vu.core.udata(cb);
	}
};