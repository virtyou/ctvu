vu.hair = {
	attach: function(hnew) {
		var head = vu.hair.person.head;
		head.detach("hair");
		head.attach(hnew, function() {
			vu.hair.register();
			vu.hair.click();
		}, true);
	},
	wild: function() {
		var zbbh = zero.base.body.hair;
		CT.modal.choice({
			data: Object.keys(zbbh).concat("custom"),
			cb: function(hvar) {
				if (hvar == "custom")
					return; // TODO .....
				vu.hair.attach(CT.merge({
					thing: "Hair",
					name: hvar,
					kind: "hair",
					bone: 4
				}, zbbh[hvar]));
			}
		});
	},
	choice: function() {
		CT.modal.choice({
			prompt: "do you want to use a hair model or the experimental wild hair?",
			data: ["model", "wild"],
			cb: function(hvar) {
				if (hvar == "model")
					return vu.media.prompt.thing(vu.hair.attach,
						"hair", vu.hair.target);
				vu.hair.wild();
			}
		});
	},
	click: function() {
		vu.hair.cb(vu.hair.target, vu.hair.choice);
	},
	register: function() {
		var h = vu.hair;
		h.target = Object.values(h.person.head.hair)[0];
		zero.core.click.register(h.target, h.click);
	},
	setup: function(person, cb) {
		vu.hair.cb = cb;
		vu.hair.person = person;
		vu.hair.register();
	}
};