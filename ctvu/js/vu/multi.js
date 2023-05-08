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
				vu.builders.play.minimap.help(zcc.person);
				vu.live.meta();
				e.stopPropagation();
			});
		}
	},
	setLang: function() {
		CT.dom.setContent(vu.multi._.langButt, vu.lang.button());
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
		var n = CT.dom.div([
			vu.controls && vu.controls.help("chatterbox"),
			CT.dom.div(butts, "right up15"),
			out, cbox
		]);
		n.out = out;
		return n;
	}
};