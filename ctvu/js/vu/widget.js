vu.widget = {
	_: {
		bridge: function(d) {
			var _ = vu.widget._;
			if (d.action == "rooms" || d.action == "people") {
				vu.core.udata(function(udata) {
					_.done(udata[d.action], d.action);
				}, true, _.key, true);
			} else // room / person
				vu.widget[d.action](d.data, d.cb && _.done);
		},
		receive: function(event) {
			var d = event.data, data = d.data, _ = vu.widget._;
			if (!d.action) return;
			_.targetOrigin = event.origin;
			if (d.action == "ping")
				return;
			if (d.action == "set") {
				for (var k in d.data)
					CT.storage.set("preset_" + k, d.data[k]);
				return;
			}
			if (d.action == "cut")
				return zero.core.current.room.cut(d.data);
			if (["move", "rotate", "upsprings"].includes(d.action))
				return zero.core.camera[d.action](d.data);
			if (["rooms", "people", "room", "person"].indexOf(d.action) != -1)
				return _.bridge(d);
			var person = zero.core.current.person;
			if (d.action == "listen")
				zero.core.rec.listen(function(phrase) { _.done(phrase, "listen"); });
			else if (d.action == "trigger") {
				person.brain.triggers[d.data] = function() {
					_.done(d.data, "trigger");
				};
			} else if (d.action == "triggers") {
				if (data)
					person.brain.triggers = data;
				else
					_.done(person.brain.triggers);
			} else if (d.action == "responses") {
				if (data == true)
					vu.core.update(_.done);
				else if (data)
					person.opts.responses = data;
				else
					_.done(person.opts.responses);
			} else
				person[d.action](data, d.cb && _.done);
		},
		variety: function() {
			var key = vu.widget._.key;
			if (key == "switcheroo")
				return "switcheroo";
			return (key.indexOf("_") != -1) ? "person" : "bridge";
		},
		done: function(data, action) {
			var _ = vu.widget._, d = {
				action: action || "cb",
				data: data
			};
			d[_.variety()] = _.key;
			window.parent.postMessage(d, _.targetOrigin);
		},
		refreshKey: function() {
			var cur = zero.core.current;
			vu.widget._.key = cur.person.opts.key + "_" + cur.room.opts.key;
		},
		setSwitcher: function() {
			var bignode = CT.dom.div(null, "biggerest bigpadded down30"), checker,
				chuckers = { person: "talk", room: "zone" }, upyou = function() {
					var u = user.core.get();
					CT.dom.setContent(bignode, u ? ("you are " + u.email) : "Who Are You?");
					if (!u)
						return vu.widget._.done(u);
					vu.core.v({
						action: "ready",
						user: u.key
					}, function(ready) {
						for (checker in chuckers) {
							if (!ready[checker]) {
								CT.dom.addContent(bignode, CT.dom.div([
									"oh no, you need a " + checker,
									CT.dom.button("create one now!", function() {
										window.open("/vu/" + chuckers[checker] + ".html", "_parent");
									})
								], "small"));
								u.unready = true;
								return vu.widget._.done(u);
							}
						}
						vu.widget._.done(u);
					});
				};
			CT.dom.setContent("ctmain", CT.dom.div([
				user.core.links(null, true),
				bignode
			], "h1 wm400p mt40 automarg centered"));
			user.core.onchange(upyou);
			setTimeout(upyou, 1000);
		},
		setCam: function(rkey) {
			CT.db.one(rkey, room => vu.widget.room(rkey), "json");
		},
		load: function() {
			var _ = vu.widget._, h = _.key = document.location.hash.slice(1);
			if (h == "switcheroo")
				_.setSwitcher();
			else if (h.startsWith("cam"))
				_.setCam(h.slice(3));
			else if (h.indexOf("_") != -1) // person / room specified - else, user key
				vu.widget.setup.apply(null, h.split("_"));
		}
	},
	room: function(rkey) {
		var room = CT.data.get(rkey);
		if (zero.core.current.room)
			zero.core.util.room(room);
		else {
			core.config.ctzero.room = room;
			zero.core.util.init();
		}
	},
	person: function(pkey, cb) {
		var _ = vu.widget._;
		if (zero.core.current.person)
			zero.core.current.person.remove();
		zero.core.util.join(vu.core.person(CT.data.get(pkey)), function(person) {
			_.refreshKey();
			person.onresolved = function() {
				_.done(null, "resolve");
			};
			cb && cb();
		}, true, true, true);
	},
	setup: function(pkey, rkey) {
		CT.db.multi([pkey, rkey], function() {
			vu.widget.room(rkey);
			vu.widget.person(pkey, vu.widget._.done);
		}, "json");
	},
	init: function() {
		vu.core.init();
		var ear = CT.dom.div(null, null, "listening_indicator");
		CT.dom.addContent("ctmain", ear);
		zero.core.rec.setIndicator(ear);
		window.addEventListener("message", vu.widget._.receive);
		vu.widget._.load();
	}
};