vu.core = {
	anonmsg: function(cb) {
		CT.modal.modal(CT.dom.div([
			"playing anonymously - log in to craft your own avatar!",
			"tap menus to expand and retract them.",
			"click the green question marks for more information!",
			CT.dom.button("tell me how to play", vu.help.generals),
			CT.dom.button("just let me play")
		], "bigger padded bold centered"), cb, null, true);
	},
	collapse: function(sel) { // for modal menus
		sel._collapsed = !sel._collapsed;
		zero.core.audio.ux(sel._collapsed ? "blipoff" : "blipon");
		sel.modal.node.classList[sel._collapsed ? "add" : "remove"]("collapsed");
	},
	swap: function(swappers, selz) { // for modal menus
		swappers.forEach(section => selz[section].modal.showHide("ctmain"));
	},
	bgen: function(opts) {
		return opts.template ? CT.module(opts.template) : function() {
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
	comp: function(target, extras) {
		var zcc = zero.core.current, cz, pers;
		if (target)
			cz = target.components(true);
		else {
			cz = zcc.room.components();
			for (pers in zcc.people)
				cz = cz.concat(zcc.people[pers].components(true));
		}
		if (extras)
			cz = extras.concat(cz);
		cz.length && CT.cc.views(cz);
	},
	menu: function(section, origin, selector, header, onclick) {
		return new CT.modal.Modal({
			center: false,
			noClose: true,
			notlatest: true,
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
	person: function(popts, invisible, pos) {
		if (invisible)
			popts.body.invisible = true;
		return zero.core.util.person(vu.core.bgen(popts.body),
			popts.name || "you", pos, popts, popts.body);
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
		var ukey = user.core.get("key");
		if (ukey && item.owners[0] == ukey) {
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
	ownz: function() {
		return zero.core.current.room.opts.owners.includes(user.core.get("key"));
	},
	my: function(mtype, cb, exporter) {
		CT.db.get(mtype, cb, null, null, null, {
			owners: {
				comparator: "contains",
				value: user.core.get("key")
			}
		}, null, null, exporter);
	},
	base: function() {
		CT.require("vu.base", true);
		vu.base.edit();
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
		if (data.anon) {
			data.person = CT.data.choice(data.people).key;
			CT.storage.set("person", data.person);
		} else
			data.person = CT.storage.get("person");
		data.person = CT.data.get(data.person);
		if (!data.person)
			return vu.core.charselect(function() { cb(); });
		cb();
	},
	setz: function() {
		var data = vu.core._udata;
		data.room = CT.storage.get("room");
		if (data.room)
			data.room = CT.data.get(data.room);
		else if (data.anon)
			data.room = CT.data.choice(data.rooms);
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
	avanon: function() {
		return core.config.ctvu.access.avanon.includes(location.pathname.split("/").pop().split(".")[0]);
	},
	udata: function(cb, allrooms, ukey, skipsets) {
		if (vu.core._udata)
			return cb(vu.core._udata);
		ukey = ukey || user.core.get("key");
		if (!(ukey || vu.core.avanon())) // cfg.access.anon must be true
			return cb(vu.core.locd());
		vu.core.z({
			action: "json",
			key: ukey,
			allrooms: allrooms
		}, function(data) {
			for (var k in data)
				CT.data.addSet(data[k]);
			if (allrooms) {
				vu.core._allrooms = data.rooms;
				if (ukey) {
					data.rooms = data.rooms.filter(function(r) {
						return r.owners.includes(ukey);
					});
				}
			}
			data.anon = !ukey;
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