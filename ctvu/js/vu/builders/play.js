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
			ran_drop: "topleft",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		norets: ["run_home", "ran_drop"],
		swappers: ["lights", "minimap", "audio", "info"],
		anonmsg: CT.dom.div([
			"playing anonymously - log in to craft your own avatar!",
			"tap menus to expand and retract them.",
			"click the green question marks for more information!",
			CT.dom.button("tell me how to play", vu.help.generals),
			CT.dom.button("just let me play")
		], "bigger padded bold centered"),
		cbs: {
			joined: function(person) { // (you)
				var vbp = vu.builders.play, _ = vbp._,
					cur = zero.core.current;
				zero.core.util.setCurPer(person);
				vu.multi.setLang();
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
			var _ = vu.builders.play._, zc = zero.core, other = [
				"SHIFT + click to approach"
			], zcc = zc.current, cam = zc.camera,
				target = thing.body || thing,
				isYou = vu.core.ischar(thing.opts.key);
			if (thing.body) {
				if (thing.automaton)
					other.push(vu.live.autochatter(thing));
				else if (vu.core.ownz()) {
					other.push(CT.dom.button("dunk", function() {
						confirm("dunk this person?") && vu.live.emit("dunk", thing.opts.key);
					}));
				}
			} else if (thing.opts.kind == "book")
				other.push(thing.readbutt());
			else if (thing.opts.kind == "carpentry" && thing.opts.items.length)
				other.push(thing.perusebutt());
			else if (thing.opts.kind == "portal")
				other.push(CT.dom.button("enter", () => zcc.person.approach(thing, _.action)));
			zc.click.register(target, function() {
				CT.dom.setContent(_.selectors.info, [
					vu.controls.help("info"),
					CT.dom.div(thing.name, "bigger"),
					isYou ? [
						CT.dom.div("(you)", "up20 right"),
						"move around with WASD",
						"rotate with Q and E",
						"adjust the camera with ARROWS",
						"zoom with PERIOD and COMMA",
						"SPACE for jump",
						"SHIFT for run",
						"ENTER to enter portal",
						"1-9 for gestures",
						"1-9 + SHIFT for dances",
						"0 to ungesture",
						"0 + SHIFT to undance",
						_.streamer()
					] : other
				]);
				zc.audio.ux("blipon");
				CT.trans.glow(_.selectors.info);
				cam.follow(target.looker || target);
				if (!isYou) {
					target.playPause(_.audup);
					CT.key.down("SHIFT") && zcc.person.approach(target);
				}
			});
		},
		streamer: function() {
			var b = CT.dom.button("start streaming", function() {
				zero.core.audio.ux("blipon");
				b._streaming = !b._streaming;
				if (b._streaming) {
					bod.streamify(CT.data.token(), true);
					b.innerHTML = "stop streaming";
				} else {
					bod.unstreamify();
					b.innerHTML = "start streaming";
				}
				vu.live.meta();
			}), bod = zero.core.current.person.body;
			return b;
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
			var vbp = vu.builders.play, _ = vbp._, atHome,
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
			selz.run_home = CT.dom.img("/img/vu/home.png",
				null, () => vu.portal.port());
			selz.ran_drop = CT.dom.img("/img/vu/home.png", null, vu.portal.rand);
			selz.chat = vu.multi.chatterbox();
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
						zero.core.camera.cutifroom();
						_.regclix();
						vbp.minimap.refresh();
						_.uplights();
						vu.core.comp();
					}
				}, CT.data.get(target || CT.storage.get("room"))));
				CT.pubsub.subscribe(cur.room.opts.key);
				atHome = vu.core.isroom(cur.room.opts.key);
				selz.run_home.modal[atHome ? "hide" : "show"]("ctmain");
				selz.ran_drop.modal[atHome ? "show" : "hide"]("ctmain");
			});
		},
		collapse: function(section) {
			var _ = vu.builders.play._, selz = _.selectors,
				sel = selz[section];
			if (_.swappers.includes(section) || _.norets.includes(section)) return;
			return () => vu.core.collapse(sel);
		},
		swap: function() {
			var _ = vu.builders.play._;
			if (!vu.core.ownz() && !_.partified) return;
			_.partified = !_.partified;
			vu.core.swap(_.swappers, _.selectors);
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section));
			if (vu.builders.play._.swappers.indexOf(section) != -1)
				n.onclick = vu.builders.play._.swap;
			return n;
		}
	},
	menus: function() {
		var sec, section, _ = vu.builders.play._, selz = _.selectors;
		user.core.get() || CT.modal.modal(_.anonmsg, null, null, true);
		_.setup();
		if (core.config.ctzero.camera.cardboard) return; // no menus necessary
		for (section in _.menus) {
			sec = selz[section];
			sec.collapser = _.collapse(section);
			sec.modal = vu.core.menu(section, _.menus[section],
				sec, _.head(section), sec.collapser);
			if (!["run_home", "lights", "audio", "auto"].includes(section)) {
				sec.modal.show("ctmain");
				(section == "chat") || setTimeout(sec.collapser);
			}
		}
	}
};