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
				CT.dom.setContent(_.langButt, vu.lang.button());
				vu.live.meta(); // for lang
			},
			chat: function(person, msg) {
				var zccp = zero.core.current.person, subs = [
					CT.dom.span(person.name, "bold italic green"),
					CT.dom.pad(),
					CT.dom.span(msg)
				], mnode;
				if (!vu.core.ischar(person.opts.key)) {
					person.setVolume(zero.core.util.close2u(person.body));
					if (person.language.code != zccp.language.code)
						subs.push(vu.lang.transer(msg, person.language, zccp.language));
				}
				mnode = CT.dom.div(subs);
				person.say(msg);
				CT.dom.addContent(vu.builders.chat._.selectors.chat.out, mnode);
				mnode.scrollIntoView();
			},
			enter: function(person) {
				person.watch(false, true);
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
			selz.chat = _.chatterbox();
		},
		chatterbox: function() {
			var zc = zero.core, zcu = zc.util, zcc = zc.current, out = CT.dom.div(null,
			"out"), _ = vu.builders.chat._, say = function(val, e) {
				val && vu.live.emit("chat", val);
				e && e.stopPropagation();
				return "clear";
			}, listButt = CT.dom.button("listen", function(e) {
				listButt.style.color = "red";
				zero.core.rec.listen(function(phrase) {
					say(phrase);
					listButt.style.color = "black";
				});
				e.stopPropagation();
			}), cbox = CT.dom.smartField(say,
				"w1 block mt5", null, null, null,
			core.config.ctvu.blurs.talk), singButt = zcu.singer(cbox, say);
			_.langButt = CT.dom.span();
			cbox.onclick = function(e) { e.stopPropagation(); };
			var n = CT.dom.div([
				CT.dom.div([singButt, listButt, _.langButt], "right up15"),
				out, cbox
			]);
			n.out = out;
			return n;
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