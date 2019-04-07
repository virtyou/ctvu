vu.embed = {
	_: {
		receive: function(event) {
			var d = event.data, data = d.data, _ = vu.embed._,
				person = zero.core.current.person;
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
			window.parent.postMessage({
				action: action || "cb",
				data: data,
				person: vu.embed._.key
			});
		}
	},
	init: function() {
		var h = vu.embed._.key = document.location.hash.slice(1),
			pkey, rkey, keys = [pkey, rkey] = h.split("_");
		CT.db.multi(keys, function(data) {
			data[1].people.push(data[0]);
			core.config.ctzero.room = data[1];
			zero.core.util.init(function(person) {
				zero.core.camera.unfollow();
				person.look(zero.core.camera);
			});
		}, "json");
		window.addEventListener("message", vu.embed._.receive);
	}
};