vu.core = {
	bgen: function(opts) {
		return opts.template ? eval(opts.template) : function() {
//			opts.joints = zero.base.joints();
//			opts.springs = zero.base.springs();
//			opts.aspects = zero.base.aspects();
//			opts.tickers = zero.base.tickers();
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
	v: function(params, cb, eb) {
		CT.net.post({
			path: "/_vu",
			params: params,
			cb: cb,
			eb: eb
		});
	},
	jlo: function(v) {
		return v.replace(/[^a-z]/g, '');
	},
	menu: function(section, origin, selector, header, onclick) {
		return new CT.modal.Modal({
			center: false,
			noClose: true,
			onclick: onclick,
			transition: "slide",
			resizeRecenter: ["top", "bottom"].includes(origin),
			slide: { origin: origin },
			content: [
				header || CT.parse.key2title(section),
				selector
			],
			className: "abs above padded bordered round pointer gmenu " + section
		});
	},
	impex: function(data, onchange) {
		(new CT.modal.Modal({
			transition: "slide",
			slide: { origin: "top" },
			content: [
				"Here's the configuration. Be careful!",
				CT.dom.smartField({
					isTA: true,
					classname: "w400p h400p",
					value: JSON.stringify(data),
					cb: function(val) {
						if (confirm("are you sure you want to save your changes?")) {
							onchange(JSON.parse(val));
							window.location = location; // lol lazy ;)
						}
					}
				})
			]
		})).show();
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
	update: function(cb, option) { // responses, gestures, dances...
		option = option || "responses";
		var person = zero.core.current.person;
		CT.db.one(person.opts.key, function(pdata) {
			person.opts[option] = pdata[option];
			cb(pdata[option]);
		}, "json", true);
	},
	person: function(popts, invisible) {
		if (invisible)
			popts.body.invisible = true;
		return zero.core.util.person(vu.core.bgen(popts.body),
			popts.name || "you", null, popts, popts.body);
	},
	room: function() {
		return CT.merge(vu.storage.get("room"), core.config.ctvu.builders.room, core.config.ctzero.room);
	},
	setroom: function(room) {
		vu.core._udata.room = room;
		CT.storage.set("room", room.key);
	},
	setchar: function(person) {
		vu.core._udata.person = person;
		CT.storage.set("person", person.key);
	},
	isroom: function(rkey) {
		return rkey == CT.storage.get("room");
	},
	ischar: function(pkey) {
		return pkey == CT.storage.get("person");
	},
	baby: function(name) {
		var d = {
			action: "person",
			name: name,
			owner: user.core.get("key")
		}, respz = CT.storage.get("preset_responses");
		if (respz)
			d.responses = respz;
		return d;
	},
	birth: function(cb) {
		CT.modal.prompt({
			prompt: "what's the new character's name?",
			cb: function(name) {
				vu.core.v(vu.core.baby(name), function(person) {
					vu.core._udata.people.push(person);
					vu.core.setchar(person);
					cb();
				});
			}
		});
	},
	charselect: function(cb) {
		CT.modal.choice({
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
	sharepop: function(item) {
		CT.modal.prompt({
			prompt: "what's your friend's email address?",
			cb: function(email) {
				vu.core.v({
					action: "share",
					content: item.key,
					email: email
				}, function() {
					alert("great!");
				}, function(msg) {
					alert(msg);
				});
			}
		});
	},
	sharer: function(item) {
		var sl = CT.dom.link("share", function() {
			vu.core.sharepop(item);
		});
		sl.update = function(newitem) {
			item = newitem;
			if (item.owners[0] == user.core.get("key"))
				sl.style.display = "inline";
			else
				sl.style.display = "none";
		};
		return sl;
	},
	share: function(item, nodes) {
		if (item.owners[0] == user.core.get("key")) {
			nodes = nodes.concat([
				CT.dom.pad(),
				vu.core.sharer(item)
			]);
		}
		return nodes;
	},
	create: function(ctype, cb, extras) {
		ctype = ctype || "game";
		CT.modal.prompt({
			prompt: "what's the new " + ctype + " called?",
			cb: function(name) {
				CT.modal.prompt({
					isTA: true,
					prompt: "please describe the " + ctype,
					cb: function(desc) {
						vu.storage.edit(CT.merge(extras, {
							modelName: ctype,
							name: name,
							description: desc,
							owners: [user.core.get("key")]
						}), cb);
					}
				});
			}
		});
	},
	my: function(mtype, cb, exporter) {
		CT.db.get(mtype, cb, null, null, null, {
			owners: {
				comparator: "contains",
				value: user.core.get("key")
			}
		}, null, null, exporter);
	},
	impconf: function() {
		var data = vu.core._udata, person = data.person;
		CT.modal.choice({
			prompt: "import configuration (mood, vibe, mods, gear, dances, gestures, responses) from whom?",
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
	},
	mebase: function() {
		var data = vu.core._udata, person = data.person;
		CT.modal.choice({
			prompt: "please select the configuration blocks you wish to share in this basepack. note that some blocks always go with other blocks - e.g. gestures and dances.",
			style: "multiple-choice",
			selections: person.basepack,
			data: ["mood", "vibe", "mods", "gear", "dances", "gestures", "responses"],
			linkages: {
				"mood": ["vibe"],
				"vibe": ["mood"],
				"dances": ["gestures"],
				"gestures": ["dances"],
				"responses": ["mood", "vibe", "mods", "gear", "dances", "gestures"]
			},
			cb: function(blocks) {
				vu.storage.edit({
					key: person.key,
					basepack: blocks
				}, function() {
					window.location = location; // oh my, what a hack!
				});
			}
		});
	},
	baseme: function() {

	},
	base: function() {
		var data = vu.core._udata, person = data.person,
			choices = [], ioin = person.basepack.length ? "is" : "is not";
		if (data.people.length > 1) // impconf()
			choices.push("import configuration");
		if (!person.basepacks.length)
			choices.push("register/edit basepack");
		if (!person.basepack.length) // TODO: if basepacks available...
			choices.push("assign/reorder basepacks");
		CT.modal.choice({
			prompt: CT.dom.div([
				CT.dom.div("basepacks and configuration", "bigger centered"),
				"The behavior and appearance of your characters are defined across a variety of configuration blocks, including: mood, vibe, mods, gear, dances, gestures, and responses.",
				"You may freely pass configuration blocks between your characters (see 'import configuration').",
				"Additionally, you have the option of sharing aspects of your characters' configuration as a basepack ('register/edit basepack'), which essentially is a public character configuration.",
				"Alternatively, you may incorporate other basepacks ('assign/reorder basepacks') into your character.",
				"In summary:",
				"- If you have more than one character, you can do a full configuration import.",
				"- If you do not have any basepacks assigned to this character, you can register this character as a basepack (composed of the configuration blocks you select).",
				"- If this character isn't registered as a basepack, you can assign basepacks. Note that order matters, as basepacks lower in the list overwrite overlapping configuration bits of higher-up basepacks.",
				"This character, " + person.name + ", " + ioin + " registered as a basepack."
			], "kidvp"),
			data: choices,
			cb: function(sel) {
				if (sel == "import configuration")
					vu.core.impconf();
				else if (sel == "register/edit basepack")
					vu.core.mebase();
				else // assign/reorder basepacks
					vu.core.baseme();
			}
		});
	},
	charlinx: function() {
		var data = vu.core._udata, person = data.person, nodes = vu.core.share(person, [
			CT.dom.link("swap", function() {
				vu.core.charselect(function() {
					window.location = location; // cheaterly!!!
				});
			})
		]);
		nodes = nodes.concat([
			CT.dom.pad(),
			CT.dom.link("base", vu.core.base)
		]);
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
	locd: function() {
		var cfg = core.config.ctvu.builders, room = vu.core.room(),
			person = CT.merge(vu.storage.get("person"), cfg.person);
		 vu.core._udata = {
			room: room,
			rooms: [room],
			person: person,
			people: [person]
		};
		return vu.core._udata;
	},
	udata: function(cb, allrooms, ukey, skipsets) {
		if (vu.core._udata)
			return cb(vu.core._udata);
		if (!(ukey || user.core.get())) // cfg.access.anon must be true
			return cb(vu.core.locd());
		ukey = ukey || user.core.get("key");
		vu.core.z({
			action: "json",
			key: ukey,
			allrooms: allrooms
		}, function(data) {
			for (var k in data)
				CT.data.addSet(data[k]);
			if (allrooms) {
				vu.core._allrooms = data.rooms;
				data.rooms = data.rooms.filter(function(r) {
					return r.owners.includes(ukey);
				});
			}
			vu.core._udata = data;
			if (skipsets)
				return cb(data);
			vu.core.seta(function() {
				vu.core.setz();
				cb(data);
			});
		});
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