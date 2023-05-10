vu.builders.chat = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			chat: "bottom"
		},
		cbs: {
			frozen: true,
			joined: function(person) { // (you)
				var vbp = vu.builders.chat, _ = vbp._,
					cur = zero.core.current,
					pb = person.body, bs = pb.springs;
				zero.core.util.setCurPer(person);
				pb.grow(0.2);
				bs.bob.value = 15;
				bs.weave.target = -20;
				person.mutesfx();
				vu.multi.setLang();
				vu.live.meta(); // for lang
			},
			enter: function(person) {
				person.watch(false, true);
				person.look(zero.core.camera);
			},
			find: function(cb) {
				var h = document.location.hash.slice(1),
					ukey = user.core.get("key");
				if (h)
					return cb(h + ukey);
				// TODO: friends list + search instead
				CT.db.get("member", function(mz) {
					CT.modal.choice({
						prompt: "who ya gonna call?",
						data: mz,
						cb: function(m) {
							vu.core.v({
								action: "call",
								email: m.email,
								caller: ukey
							});
							cb(ukey + m.key);
						}
					});
				});
			}
		},
		setup: function() {
			var vbp = vu.builders.chat, _ = vbp._,
				selz = _.selectors, cur = zero.core.current,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.chat = vu.multi.chatterbox();
		}
	},
	menus: function() {
		var section, _ = vu.builders.chat._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};