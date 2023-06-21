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
		cbs: {
			joined: function(person) { // (you)
				var vbp = vu.builders.play, _ = vbp._,
					cur = zero.core.current;
				vu.multi.setLang();
				vu.controls.initCamera(_.selectors.cameras);
				vu.controls.setTriggers(_.selectors.triggers, vu.live.meta);
				vu.controls.setGestures(_.selectors.gestures, vu.live.meta);
				cur.controls = _.controls = new zero.core.Controls({
					cams: true,
					cb: vu.clix.action,
					target: person,
					moveCb: vu.live.meta
				});
				vbp.minimap = cur.minimap = new vu.menu.Map({ node: _.selectors.minimap });
				vu.core.ownz() && _.selectors.lights.update();
				vu.clix.room();
				zero.core.click.trigger(person.body);
				core.config.ctzero.camera.cardboard && vu.voice.listen();
				vu.core.comp();
				person.body.onthrust(_.thrust);
				cur.sploder = new zero.core.Sploder();
			},
			enter: function(person) {
				vu.clix.register(person);
				vu.core.comp(person);
			}
		},
		thrust: function(side) {
			var held = zero.core.current.person.held(side);
			held && held.touch();
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
			vu.clix.init({
				audup: _.audup,
				auto: selz.auto,
				info: selz.info,
				streamer: _.streamer
			});
			vu.portal.on("eject", function(portout) {
				vu.live.emit("eject", portout);
				CT.pubsub.unsubscribe(cur.room.opts.key);
			});
			vu.portal.on("inject", function(target, portin) {
				zero.core.util.room(CT.merge({
					onbuild: function(room) {
						vu.live.emit("inject", portin);
						zero.core.camera.cutifroom();
						vu.clix.room();
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
		user.core.get() || vu.core.anonmsg();
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