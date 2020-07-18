vu.builders.play = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		emitters: ["vibe", "gesture", "dance", "mod"],
		menus: {
			chat: "bottom",
			cameras: "top",
			info: "topleft",
			minimap: "topright",
			run_home: "topright",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		cbs: {
			moved: function(name) {
				vu.builders.play._.minimap.update(name);
				vu.live.emit();
			},
			joined: function(person) { // (you)
				var _ = vu.builders.play._, cur = zero.core.current;
				cur.person = person;
				vu.controls.initCamera(_.selectors.cameras);
				vu.controls.setTriggers(_.selectors.triggers, _.emit);
				vu.controls.setGestures(_.selectors.gestures, _.emit);
				_.controls = new zero.core.Controls({
					cb: _.action,
					target: person,
					moveCb: _.cbs.moved
				});
				_.minimap = new vu.menu.Map({ node: _.selectors.minimap });
				cur.room.objects.forEach(_.clickreg);
				zero.core.click.trigger(person.body);
			},
			chat: function(person, msg) {
				var mnode = CT.dom.div([
					CT.dom.span(person.name, "bold italic green"),
					CT.dom.pad(),
					CT.dom.span(msg)
				]);
				if (!vu.core.ischar(person.opts.key)) {
					var r = zero.core.current.room, you = zero.core.current.person,
						diameter = r.bounds.min.distanceTo(r.bounds.max),
						dist = person.body.position().distanceTo(you.body.position());
					person.setVolume(1 - dist / diameter);
				}
				person.say(msg, null, true);
				CT.dom.addContent(vu.builders.play._.selectors.chat.out, mnode);
				mnode.scrollIntoView();
			},
			enter: function(person) {
				vu.builders.play._.clickreg(person);
			}
		},
		clickreg: function(thing) {
			var isYou = vu.core.ischar(thing.opts.key),
				target = thing.body || thing;
			zero.core.click.register(target, function() {
				CT.dom.setContent(vu.builders.play._.selectors.info, [
					CT.dom.div(thing.name, "bigger"),
					isYou ? [
						CT.dom.div("(you)", "up20 right"),
						"move around with wasd",
						"SPACE for jump",
						"SHIFT for run",
						"1-9 for gestures",
						"1-9 + SHIFT for dances",
						"0 to ungesture",
						"0 + SHIFT to undance"
					] : [
						"SHIFT + click to approach"
					]
				]);
				zero.core.camera.follow(target.looker || target);
				if (!isYou) {
					target.playPause();
					CT.key.down("SHIFT") && zero.core.current.person.approach(target);
				}
			});
		},
		emit: function(action, val) {
			if (vu.builders.play._.emitters.indexOf(action) != -1)
				return vu.live.emit();
			CT.pubsub.publish(zero.core.current.room.opts.key, {
				action: action,
				data: val
			});
		},
		action: function() {
			// TODO: other actions.....
			vu.portal.check();
		},
		setup: function() {
			var _ = vu.builders.play._, selz = _.selectors,
				cur = zero.core.current,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.cameras = CT.dom.div(null, "centered");
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
			selz.minimap = CT.dom.div();
			selz.run_home = CT.dom.img("/img/vu/home.png", null,
				function() { vu.portal.port(); });
			selz.chat = _.chatterbox();
			selz.info = CT.dom.div();
			vu.portal.on("eject", function(portout) {
				_.emit("eject", portout);
				CT.pubsub.unsubscribe(cur.room.opts.key);
			});
			vu.portal.on("inject", function(target, portin) {
				zero.core.util.room(CT.merge({
					onbuild: function(room) {
						_.emit("inject", portin);
						room.cut();
						room.objects.forEach(_.clickreg);
						_.minimap.refresh();
					}
				}, CT.data.get(target || CT.storage.get("room"))));
				CT.pubsub.subscribe(cur.room.opts.key);
				selz.run_home.modal[vu.core.isroom(cur.room.opts.key)
					? "hide" : "show"]("ctmain");
			});
		},
		chatterbox: function() {
			var out = CT.dom.div(null, "out"), say = function(val, e) {
				val && vu.builders.play._.emit("chat", val);
				e && e.stopPropagation();
				return "clear";
			}, listButt = CT.dom.button("listen", function(e) {
				listButt.style.color = "red";
				zero.core.rec.listen(function(phrase) {
					say(phrase);
					listButt.style.color = "black";
				});
				e.stopPropagation();
			}, "right up20"), cbox = CT.dom.smartField(say, "w1 block mt5",
				null, null, null, core.config.ctvu.blurs.talk);
			cbox.onclick = function(e) { e.stopPropagation(); };
			var n = CT.dom.div([ listButt, out, cbox ]);
			n.out = out;
			return n;
		},
		collapse: function(section) {
			var _ = vu.builders.play._, selz = _.selectors,
				sel = selz[section];
			return function() {
				sel._collapsed = !sel._collapsed;
				sel.modal.node.classList[sel._collapsed ? "add" : "remove"]("collapsed");
			};
		}
	},
	menus: function() {
		var section, _ = vu.builders.play._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section, _.menus[section],
				selz[section], null, vu.builders.play._.collapse(section));
			if (section != "run_home")
				selz[section].modal.show("ctmain");
		}
	}
};