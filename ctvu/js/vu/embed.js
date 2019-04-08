vu.embed = {
	_: {
		bridge: function(d) {
			var _ = vu.embed._;
			if (d.action == "rooms" || d.action == "people") {
				vu.core.udata(function(udata) {
					_.done(udata[d.action], d.action);
				}, true, _.key);
			} else // room / person
				vu.embed[d.action](d.data);
		},
		receive: function(event) {
			var d = event.data, data = d.data, _ = vu.embed._;
			if (["rooms", "people", "room", "person"].indexOf(d.action) != -1)
				return _.bridge(d);
			var person = zero.core.current.person;
			if (d.action == "listen")
				zero.core.rec.listen(_.done);
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
				if (data)
					person.opts.responses = data;
				else
					_.done(person.opts.responses);
			} else
				person[d.action](data, d.cb && _.done);
		},
		done: function(data, action) {
			var _ = vu.embed._, d = {
				action: action || "cb",
				data: data
			};
			d[(_.key.indexOf("_") != -1) ? "person" : "bridge"] = _.key;
			window.parent.postMessage(d);
		},
		refreshKey: function() {
			var cur = zero.core.current;
			vu.embed._.key = cur.person.opts.key + "_" + cur.room.opts.key;
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
		if (zero.core.current.person)
			zero.core.current.person.remove();
		zero.core.util.join(CT.data.get(pkey), function() {
			vu.embed._.refreshKey();
			cb && cb();
		}, true, true, true);
	},
	setup: function(pkey, rkey) {
		CT.db.multi([pkey, rkey], function() {
			vu.embed.room(rkey);
			vu.embed.person(pkey);
		}, "json");
	},
	init: function() {
		var ear = CT.dom.div(null, null, "listening_indicator");
		CT.dom.addContent("ctmain", ear);
		zero.core.rec.setIndicator(ear);
		window.addEventListener("message", vu.embed._.receive);
		var h = vu.embed._.key = document.location.hash.slice(1);
		if (h.indexOf("_") != -1) // person / room specified - else, user key
			vu.embed.setup.apply(null, h.split("_"));
		vu.embed._.done();
	}
};