vu.builders.play = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			chat: "bottom",
			cameras: "top",
			run_home: "topright",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		joined: function(person) {
			var _ = vu.builders.play._;
			vu.builders.current.person = zero.core.current.person = person;
			vu.controls.initCamera(_.selectors.cameras);
			vu.controls.setTriggers(_.selectors.triggers);
			vu.controls.setGestures(_.selectors.gestures);
			_.controls = new zero.core.Controls({
				cb: _.action,
				target: person,
				moveCb: vu.live.up
			});
		},
		port: function(target) {
			var _ = vu.builders.play._, cur = zero.core.current;
			CT.pubsub.unsubscribe(cur.room.opts.key);
			zero.core.util.room(CT.data.get(target || CT.storage.get("room")));
			CT.pubsub.subscribe(cur.room.opts.key);
			_.selectors.run_home.modal[vu.core.isroom(cur.room.opts.key)
				? "hide" : "show"]("ctmain");
		},
		action: function() {
			var _ = vu.builders.play._,
				cur = zero.core.current, person = cur.person,
				pos = person.body.bone.position, hit = false;
			cur.room.objects.filter(function(obj) {
				var o = obj.opts, og = o.portals && o.portals.outgoing;
				return og && og.target;
			}).forEach(function(portal) {
				if (hit) return;
				var dist = portal.position().distanceTo(pos);
				CT.log(portal.name + " " + dist);
				if (dist < 100) {
					hit = true;
					CT.db.one(portal.opts.portals.outgoing.target, function(target) {
						if (target.owner) // room
							person.say("this door is locked");
						else
							_.port(target.parent);
					}, "json");
				}
			});
		},
		chat: function(person, msg) {
			var mnode = CT.dom.div([
				CT.dom.span(person.name, "bold italic green"),
				CT.dom.pad(),
				CT.dom.span(msg)
			]);
			person.say(msg, null, true);
			CT.dom.addContent(vu.builders.play._.selectors.chat.out, mnode);
			mnode.scrollIntoView();
		},
		setup: function() {
			var _ = vu.builders.play._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				blurs = core.config.ctvu.blurs;
			_.raw = vu.core.person(popts);
			selz.cameras = CT.dom.div(null, "centered");
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
			selz.run_home = CT.dom.img("/img/home.png", null, function() { _.port(); });
			var out = CT.dom.div(null, "out"), say = function(val) {
				val && CT.pubsub.publish(zero.core.current.room.opts.key, val);
				return "clear";
			}, listButt = CT.dom.button("listen", function(e) {
				listButt.style.color = "red";
				zero.core.rec.listen(function(phrase) {
					say(phrase);
					listButt.style.color = "black";
				});
				e.stopPropagation();
			}, "right up20"), cbox = CT.dom.smartField(say, "w1 block mt5", null, null, null, blurs.talk);
			cbox.onclick = function(e) { e.stopPropagation(); };
			selz.chat = CT.dom.div([ listButt, out, cbox ]);
			selz.chat.out = out;
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