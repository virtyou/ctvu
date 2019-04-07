vu.embed = {
	_: {
		receive: function(event) {
			var d = event.data, data = d.data,
				person = zero.core.current.person;
			if (d.action == "triggers") {
				if (data)
					person.brain.triggers = data;
				else
					vu.embed._.done(d.cb, person.brain.triggers);
			} else if (d.action == "responses") {
				if (data)
					person.opts.responses = data;
				else
					vu.embed._.done(d.cb, person.opts.responses);
			} else {
				person[d.action](data, function() {
					d.cb && vu.embed._.done(d.cb);
				});
			}
		},
		done: function(cbkey, data) {
			window.parent.postMessage({
				action: "cb",
				data: data,
				person: cbkey
			});
		}
	},
	init: function() {
		var h = document.location.hash.slice(1),
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