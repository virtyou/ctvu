vu.core = {
	bgen: function(opts) {
		return opts.template ? eval(opts.template) : function() {
			opts.joints = zero.base.joints();
			opts.springs = zero.base.springs();
			opts.aspects = zero.base.aspects();
			opts.tickers = zero.base.tickers();
			return opts;
		};
	},
	z: function(params, cb) { // probs move to ctzero
		CT.net.post({
			path: "/_zero",
			params: params,
			cb: cb
		});
	},
	prompt: function(opts) {
		(new CT.modal.Prompt(CT.merge(opts, {
			transition: "slide"
		}))).show();
	},
	fieldList: function(node, values, cb, generator, onadd, onremove) {
		cb = cb || node.update;
		node.fields = CT.dom.fieldList(values, generator || function(v) {
			var f = CT.dom.field(null, v);
			if (v)
				f.onkeyup = cb;
			return f;
		}, null, onadd || cb, onremove || cb);
		CT.dom.setContent(node, [
			node.fields.empty,
			node.fields.addButton,
			node.fields
		]);
	},
	room: function() {
		return CT.merge(vu.storage.get("room"), core.config.ctvu.builders.room, core.config.ctzero.room);
	},
	udata: function(cb) {
		if (vu.core._udata)
			return cb(vu.core._udata);
		if (!user.core.get()) { // cfg.access.anon must be true
			var cfg = core.config.ctvu.builders;
			return cb({
				people: [CT.merge(vu.storage.get("person"), cfg.person)],
				rooms: [vu.core.room()]
			});
		}
		vu.core.z({
			action: "json",
			key: user.core.get("key")
		}, function(data) {
			for (var k in data)
				CT.data.addSet(data[k]);
			vu.core._udata = data;
			cb(data);
		});
	},
	color: function(key, val, cb) {
		var id = key.replace(/ /g, ""),
			n = CT.dom.field(id, val, "block", null, null, {
				color: "gray",
				background: val
			});
		CT.dom.doWhenNodeExists(id, function() { // wait a tick
			n.picker = jsColorPicker("input#" + id, {
				color: val,
				readOnly: true,
				actionCallback: cb
			});
		});
		return n;
	},
	// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
	hex2rgb: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16) / 255,
			g: parseInt(result[2], 16) / 255,
			b: parseInt(result[3], 16) / 255
		} : null;
	},
	init: function() {
		var cfg = core.config.ctvu.loaders;
		cfg.customs.forEach(function(cus) {
			CT.require("custom." + cus, true);
		});
		cfg.templates.forEach(function(tmp) {
			CT.require("templates." + tmp, true);
		});
	}
};

vu.core.init();