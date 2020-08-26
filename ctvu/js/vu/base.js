vu.base = {
	_: {
		reload: function() {
			window.location = location; // oh my, what a hack!
		}
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
				}, vu.base_.reload);
			}
		});
	},
	share: function() {
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
				}, vu.base._.reload);
			}
		});
	},
	reorder: function() {
		var data = vu.core._udata, person = data.person;
		CT.modal.prompt({
			prompt: "order your basepacks. higher basepacks are loaded first, so lower basepacks overwrite higher ones.",
			style: "reorder",
			data: person.basepacks,
			rower: function(bp) {
				return CT.dom.div([
					CT.dom.div(bp.label, "big"),
					bp.pack.map(cblock => CT.dom.div(cblock,
						"bordered padded margined inline-block"))
				], "centered");
			},
			cb: function(bps) {
				vu.storage.edit({
					key: person.key,
					basepacks: bps.map(b => b.key)
				}, vu.base._.reload);
			}
		});
	},
	newb: function() {
		var data = vu.core._udata, person = data.person;
		CT.db.get("person", function(pz) {
			var bpkz = person.basepacks.map(bp => bp.key);
			CT.modal.choice({
				prompt: "please select some basepacks",
				style: "multiple-choice",
				data: pz.filter(p => !bpkz.includes(p.key)),
				cb: function(bpz) {
					bpkz = bpkz.concat(bpz.map(bp => bp.key));
					vu.storage.edit({
						key: person.key,
						basepacks: bpkz
					}, vu.base._.reload);
				}
			});
		}, null, null, null, {
			"basepack": { "comparator": "!=", "value": [] }
		});
	},
	delb: function() {
		var data = vu.core._udata, person = data.person,
			bpkz = person.basepacks.map(bp => bp.key), bp;
		CT.modal.choice({
			prompt: "please select the basepacks you wish to remove",
			style: "multiple-choice",
			data: person.basepacks,
			cb: function(bpz) {
				for (bp of bpz)
					CT.data.remove(bpkz, bp.key);
				vu.storage.edit({
					key: person.key,
					basepacks: bpkz
				}, vu.base._.reload);
			}
		});
	},
	bases: function() {
		var data = vu.core._udata, person = data.person;
		if (!person.basepacks.length)
			return vu.base.newb();
		CT.modal.choice({
			prompt: "add, remove, or reorder?",
			data: ["add", "remove", "reorder"],
			cb: function(sel) {
				if (sel == "add")
					return vu.base.newb();
				else if (sel == "remove")
					vu.base.delb();
				else // reorder
					vu.base.reorder();
			}
		});
	},
	edit: function() {
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
					vu.base.impconf();
				else if (sel == "register/edit basepack")
					vu.base.share();
				else // assign/reorder basepacks
					vu.base.bases();
			}
		});
	}
};