vu.builders.play = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			chat: "bottom",
			cameras: "top",
			auto: "left",
			info: "topleft",
			audio: "topleft",
			lights: "topright",
			minimap: "topright",
			run_home: "topleft",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		swappers: ["lights", "minimap", "audio", "info"],
		anonmsg: CT.dom.div("playing anonymously - log in to craft your own avatar!", "bigger padded bold"),
		cbs: {
			joined: function(person) { // (you)
				var vbp = vu.builders.play, _ = vbp._,
					cur = zero.core.current;
				zero.core.util.setCurPer(person);
				CT.dom.setContent(_.langButt, vu.lang.button());
				vu.controls.initCamera(_.selectors.cameras);
				vu.controls.setTriggers(_.selectors.triggers, vu.live.meta);
				vu.controls.setGestures(_.selectors.gestures, vu.live.meta);
				cur.controls = _.controls = new zero.core.Controls({
					cams: true,
					cb: _.action,
					target: person,
					moveCb: vu.live.meta
				});
				vbp.minimap = new vu.menu.Map({ node: _.selectors.minimap });
				vu.core.ownz() && _.selectors.lights.update();
				_.regclix();
				zero.core.click.trigger(person.body);
				core.config.ctzero.camera.cardboard && vu.voice.listen();
				vu.core.comp();
				CT.pubsub.subscribe("global");
				user.core.get("admin") && CT.pubsub.subscribe("admin");
			},
			chat: function(person, msg, squad, squinvite) {
				var zccp = zero.core.current.person, subs = [
					CT.dom.span(person.name, "bold italic green")
				], mnode;
				squad && subs.push(CT.dom.span("[" + squad + "]", "bold"));
				subs.push(CT.dom.pad());
				subs.push(CT.dom.span(msg));
				squinvite && subs.push(CT.dom.button("click here to join " + squinvite,
					() => vu.squad.join(squinvite)));
				if (!vu.core.ischar(person.opts.key)) {
					person.setVolume(zero.core.util.close2u(person.body));
					if (person.language && person.language.code != zccp.language.code)
						subs.push(vu.lang.transer(msg, person.language, zccp.language));
				}
				mnode = CT.dom.div(subs);
				person.say(msg, null, true);
				CT.dom.addContent(vu.builders.play._.selectors.chat.out, mnode);
				mnode.scrollIntoView();
			},
			enter: function(person) {
				vu.builders.play._.clickreg(person);
				vu.core.comp(person);
			}
		},
		regclix: function() {
			var _ = vu.builders.play._, room = zero.core.current.room;
			room.objects.forEach(_.clickreg);
			room.automatons.forEach(a => a.onperson(_.autoset));
		},
		autoset: function(p) {
			var _ = vu.builders.play._;
			vu.help.triggerize(p.brain, _.selectors.auto, vu.squad.emit);
			_.clickreg(p);
		},
		clickreg: function(thing) {
			var _ = vu.builders.play._, zccp = zero.core.current.person,
				isYou = vu.core.ischar(thing.opts.key),
				target = thing.body || thing,
				other = [
					"SHIFT + click to approach"
				];
			if (thing.body) {
				if (thing.automaton) {
					var cbutt = CT.dom.button("chat", function() {
						thing.automaton.pause();
						thing.look(zccp.body, true);
						zccp.onsaid(statement => thing.respond(statement, null, true,
							msg => vu.live.botchat(thing.name, msg)));
						CT.dom.setContent(cbox, cchatting);
					}), cstop = CT.dom.button("stop chatting", function() {
						thing.unlook();
						thing.automaton.play();
						zccp.onsaid();
						CT.dom.setContent(cbox, cbutt);
					}), chelp = CT.dom.button("help!", function() {
						vu.squad.emit("enable help mode");
					}), cchatting = CT.dom.div([
						cstop, chelp
					]), cbox = CT.dom.div(cbutt);
					other.push(cbox);
				} else if (vu.core.ownz()) {
					other.push(CT.dom.button("dunk", function() {
						confirm("dunk this person?") && vu.live.emit("dunk", thing.opts.key);
					}));
				}
			} else if (thing.opts.kind == "book")
				other.push(thing.readbutt());
			else if (thing.opts.kind == "carpentry" && thing.opts.items.length)
				other.push(thing.perusebutt());
			zero.core.click.register(target, function() {
				CT.dom.setContent(_.selectors.info, [
					CT.dom.div(thing.name, "bigger"),
					isYou ? [
						CT.dom.div("(you)", "up20 right"),
						"move around with wasd",
						"SPACE for jump",
						"SHIFT for run",
						"ENTER to enter portal",
						"1-9 for gestures",
						"1-9 + SHIFT for dances",
						"0 to ungesture",
						"0 + SHIFT to undance"
					] : other
				]);
				zero.core.camera.follow(target.looker || target);
				if (!isYou) {
					target.playPause(_.audup);
					CT.key.down("SHIFT") && zero.core.current.person.approach(target);
				}
			});
		},
		action: function() {
			// TODO: other actions.....
			vu.portal.check();
		},
		uplights: function() {
			var _ = vu.builders.play._;
			if (vu.core.ownz())
				_.selectors.lights.update();
			else if (_.partified)
				_.swap();
		},
		lightup: function(lnum, property, val, pindex, paxis) {
			var edata = { light: lnum };
			edata[property] = val;
			if (paxis) // for position
				edata.axis = paxis;
			var fdata = { lights: {} };
			fdata.lights[lnum] = edata;
			vu.live.zmeta(fdata);
		},
		audup: function(track, player) {
			var adata = {};
			adata[player || track.kind] = track;
			vu.live.zmeta({
				audio: adata
			});
		},
		setup: function() {
			var vbp = vu.builders.play, _ = vbp._,
				selz = _.selectors, cur = zero.core.current,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			cur.audio = new vu.audio.Controller();
			selz.cameras = CT.dom.div(null, "centered");
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
			selz.minimap = CT.dom.div();
			selz.audio = vu.party.audio(_.audup);
			selz.lights = vu.party.lights(_.lightup);
			selz.run_home = CT.dom.img("/img/vu/home.png", null,
				function() { vu.portal.port(); });
			selz.chat = _.chatterbox();
			selz.info = CT.dom.div();
			selz.auto = CT.dom.div();
			vu.portal.on("eject", function(portout) {
				vu.live.emit("eject", portout);
				CT.pubsub.unsubscribe(cur.room.opts.key);
			});
			vu.portal.on("inject", function(target, portin) {
				zero.core.util.room(CT.merge({
					onbuild: function(room) {
						vu.live.emit("inject", portin);
						room.cut();
						_.regclix();
						vbp.minimap.refresh();
						_.uplights();
						vu.core.comp();
					}
				}, CT.data.get(target || CT.storage.get("room"))));
				CT.pubsub.subscribe(cur.room.opts.key);
				selz.run_home.modal[vu.core.isroom(cur.room.opts.key)
					? "hide" : "show"]("ctmain");
			});
		},
		chatterbox: function() {
			var zc = zero.core, zcu = zc.util, zcc = zc.current, out = CT.dom.div(null,
			"out"), _ = vu.builders.play._, say = function(val, e) {
				val && vu.squad.emit(val);
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
			core.config.ctvu.blurs.talk), helpButt = CT.dom.button("help", function(e) {
				zcc.person.helpMe = !zcc.person.helpMe;
				if (zcc.person.helpMe) {
					helpButt.style.color = "red";
					helpButt.innerText = "unhelp";
				} else {
					helpButt.style.color = "black";
					helpButt.innerText = "help";
				}
				vu.builders.play.minimap.help(zcc.person);
				vu.live.meta();
				e.stopPropagation();
			}), squadButt = vu.squad.butt(), singButt = zcu.singer(cbox, say);
			_.langButt = CT.dom.span();
			cbox.onclick = function(e) { e.stopPropagation(); };
			var n = CT.dom.div([
				CT.dom.div([squadButt, singButt, listButt, _.langButt, helpButt], "right up15"),
				out, cbox
			]);
			n.out = out;
			return n;
		},
		collapse: function(section) {
			var _ = vu.builders.play._, selz = _.selectors,
				sel = selz[section];
			if (_.swappers.includes(section)) return;
			return function() {
				sel._collapsed = !sel._collapsed;
				sel.modal.node.classList[sel._collapsed ? "add" : "remove"]("collapsed");
			};
		},
		swap: function() {
			var _ = vu.builders.play._, selz = _.selectors;
			if (!vu.core.ownz() && !_.partified) return;
			_.partified = !_.partified;
			_.swappers.forEach(function(section) {
				selz[section].modal.showHide("ctmain");
			});
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section));
			if (vu.builders.play._.swappers.indexOf(section) != -1)
				n.onclick = vu.builders.play._.swap;
			return n;
		}
	},
	menus: function() {
		var section, _ = vu.builders.play._, selz = _.selectors;
		user.core.get() || CT.modal.modal(_.anonmsg,
			CT.dom.id("helperoo").onclick);
		_.setup();
		if (core.config.ctzero.camera.cardboard) return; // no menus necessary
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section, _.menus[section],
				selz[section], _.head(section), _.collapse(section));
			if (!["run_home", "lights", "audio", "auto"].includes(section))
				selz[section].modal.show("ctmain");
		}
	}
};