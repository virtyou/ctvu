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
	v: function(params, cb) {
		CT.net.post({
			path: "/_vu",
			params: params,
			cb: cb
		});
	},
	jlo: function(v) {
		return v.replace(/[^a-z]/g, '');
	},
	prompt: function(opts) {
		(new CT.modal.Prompt(CT.merge(opts, {
			transition: "slide"
		}))).show();
	},
	menu: function(section, origin, selector, header) {
		return new CT.modal.Modal({
			center: false,
			noClose: true,
			transition: "slide",
			slide: { origin: origin },
			content: [
				header || CT.parse.capitalize(section),
				selector
			],
			className: "abs above padded bordered round pointer gmenu " + section
		});
	},
	choice: function(opts) {
		vu.core.prompt(CT.merge(opts, {
			noClose: true,
			defaultIndex: 0,
			style: "single-choice"
		}));
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
	person: function(popts) {
		return zero.core.util.person(vu.core.bgen(popts.body),
			popts.name || "you", null, popts, popts.body);
	},
	room: function() {
		return CT.merge(vu.storage.get("room"), core.config.ctvu.builders.room, core.config.ctzero.room);
	},
	setchar: function(person) {
		vu.core._udata.person = person;
		CT.storage.set("person", person.key);
	},
	birth: function(cb) {
		vu.core.prompt({
			prompt: "what's the new character's name?",
			cb: function(name) {
				vu.core.v({
					action: "person",
					name: name,
					owner: user.core.get("key")
				}, function(person) {
					vu.core._udata.people.push(person);
					vu.core.setchar(person);
					cb();
				});
			}
		});
	},
	charselect: function(cb) {
		vu.core.choice({
			prompt: "select character",
			data: [{ name: "new character" }].concat(vu.core._udata.people),
			cb: function(person) {
				if (person.name == "new character")
					return vu.core.birth(cb);
				vu.core.setchar(person);
				cb();
			}
		});
	},
	charlinx: function() {
		var data = vu.core._udata, person = data.person, nodes = [
			CT.dom.link("swap", function() {
				vu.core.charselect(function() {
					window.location = location; // cheaterly!!!
				});
			})
		];
		if (data.people.length > 1) {
			nodes = nodes.concat([
				CT.dom.pad(),
				CT.dom.link("import", function() {
					vu.core.choice({
						prompt: "import configuration (morphs, vibe, gestures, dances, responses) from whom?",
						data: data.people.filter(function(peep) {
							return peep.name != person.name;
						}),
						cb: function(whom) {
							vu.core.v({
								action: "import",
								from: whom.key,
								to: person.key
							}, function() {
								window.location = location; // oh my, what a hack!
							});
						}
					});
				})
			]);
		}
		return CT.dom.div([[
			CT.dom.span("hello,"),
			CT.dom.pad(),
			CT.dom.span(person.name, "bold")
		], nodes], "left shiftall");
	},
	seta: function(cb) {
		var data = vu.core._udata;
		data.person = CT.storage.get("person");
		if (!data.person)
			return vu.core.charselect(function() { cb(); });
		data.person = CT.data.get(data.person);
		cb();
	},
	setz: function() {
		var data = vu.core._udata;
		data.room = CT.storage.get("room");
		if (data.room)
			data.room = CT.data.get(data.room);
		else
			data.room = data.rooms[0];
	},
	udata: function(cb) {
		if (vu.core._udata)
			return cb(vu.core._udata);
		if (core.config.ctvu.storage.mode == "local" || !user.core.get()) {
			 // cfg.access.anon must be true
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
			vu.core.seta(function() {
				vu.core.setz();
				cb(data);
			});
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