vu.multi = {
	_: {
		listener: function() {
			var listButt = CT.dom.button("listen", function(e) {
				listButt.style.color = "red";
				zero.core.rec.listen(function(phrase) {
					vu.multi._.sayer(phrase);
					listButt.style.color = "black";
				});
				e.stopPropagation();
			});
			return listButt;
		},
		sayer: function(val, e) {
			val && vu.squad.emit(val);
			e && e.stopPropagation();
			return "clear";
		},
		helper: function() {
			var zcc = zero.core.current;
			return CT.dom.button("help", function(e) {
				zcc.person.helpMe = !zcc.person.helpMe;
				if (zcc.person.helpMe) {
					helpButt.style.color = "red";
					helpButt.innerText = "unhelp";
					vu.live.helpme();
				} else {
					helpButt.style.color = "black";
					helpButt.innerText = "help";
				}
				zcc.minimap.help(zcc.person);
				vu.live.meta();
				e.stopPropagation();
			});
		},
		roomvite: function(rkey) {
			var n = CT.dom.span();
			CT.db.one(rkey, function(room) {
				CT.dom.setContent(n, CT.dom.button("warp to " + room.name, function(e) {
					vu.portal.port(rkey);
					e.stopPropagation();
				}));
			}, "json");
			return n;
		},
		gamevite: function(gkey) {
			var n = CT.dom.span();
			CT.db.one(gkey, function(game) {
				CT.dom.setContent(n, CT.dom.button("warp to " + game.name, function() {
					location = "/vu/adventure.html#" + gkey;
				}));
			});
			return n;
		}
	},
	setLang: function() {
		CT.dom.setContent(vu.multi._.langButt, vu.lang.button());
	},
	chat: function(person, msg, squad, squinvite, roomvite, gamevite) {
		var zccp = zero.core.current.person, subs = [
			CT.dom.span(person.name, "bold italic green")
		], _ = vu.multi._, mnode;
		squad && subs.push(CT.dom.span("[" + squad + "]", "bold"));
		subs.push(CT.dom.pad());
		subs.push(CT.dom.span(msg));
		squinvite && subs.push(CT.dom.button("click here to join " + squinvite, function(e) {
			vu.squad.join(squinvite);
			e.stopPropagation();
		}));
		roomvite && subs.push(_.roomvite(roomvite));
		gamevite && subs.push(_.gamevite(gamevite));
		if (person.opts) { // otherwise, person is just {name}
			if (!vu.core.ischar(person.opts.key)) {
				person.setVolume(zero.core.util.close2u(person.body));
				if (person.language && person.language.code != zccp.language.code)
					subs.push(vu.lang.transer(msg, person.language, zccp.language));
			}
			person.say(msg, null, true);
		}
		mnode = CT.dom.div(subs);
		CT.trans.glow(_.cbox.previousSibling);
		CT.dom.addContent(_.cbox.out, mnode);
		mnode.scrollIntoView();
	},
	chatterbox: function() {
		var _ = vu.multi._, zc = zero.core, zcu = zc.util, zcc = zc.current,
			out = CT.dom.div(null, "out"), cbox = CT.dom.smartField(_.sayer,
				"w1 block mt5", null, null, null, core.config.ctvu.blurs.talk);
		_.langButt = CT.dom.span();
		var butts = [zcu.singer(cbox, _.sayer), _.listener(), _.langButt];
		if (location.pathname != "/vu/chat.html") {
			butts.unshift(vu.squad.butt());
			butts.push(_.helper());
		}
		cbox.onclick = e => e.stopPropagation();
		var n = _.cbox = CT.dom.div([
			vu.controls && vu.controls.help("chatterbox"),
			CT.dom.div(butts, "right up15"),
			out, cbox
		]);
		n.out = out;
		return n;
	}
};