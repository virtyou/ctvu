vu.party = {
	_: {
		lightdirs: {
			point: "Position",
			directional: "Direction"
		},
		lights: ["ambient", "directional", "point"],
		auds: ["music", "ambient", "fx"],
		aud: function(kind, updater) {
			var cur = zero.core.current, swapper = CT.dom.link("play", function() {
				CT.modal.choice({
					prompt: "enter a url or consult the collection?",
					data: ["url", "collection"],
					cb: function(sel) {
						if (sel == "url") {
							CT.modal.prompt({
								prompt: "what's the url?",
								cb: url => update(cur.audio.url(url, kind))
							});
						} else {
							vu.media.swapper.audio(function(edata) {
								cur.audio.add(edata, true);
								update(edata);
							}, kind);
						}
					}
				});
			}), update = function(edata) {
				swapper.innerHTML = edata.name;
				updater(edata);
			};
			return [
				kind,
				swapper
			];
		}
	},
	audio: function(updater) {
		var _ = vu.party._;
		return CT.dom.div(_.auds.map(k => _.aud(k, updater)));
	},
	lights: function(updater, addAndRemove) {
		var _ = vu.party._, lnode = CT.dom.div(),
			room, color, intensity, content;
		lnode.update = function() {
			room = zero.core.current.room;
			CT.dom.setContent(lnode, [
				addAndRemove && CT.dom.button("add", function() {
					CT.modal.choice({
						data: _.lights,
						cb: function(variety) {
							room.addLight({
								variety: variety
							}, null, true);
							lnode.update();
						}
					});
				}, "vcrunch right"),
				room.lights.map(function(light, i) {
					color = vu.color.selector(light, null, i, function(col, lnum) {
						updater(lnum, "color", col);
					});
					intensity = CT.dom.range(function(val) {
						val = parseInt(val) / 100;
						light.setIntensity(val);
						updater(i, "intensity", val);
					}, 0, 100, light.opts.intensity * 100, 1, "w1");
					content = [
						addAndRemove && CT.dom.button("remove", function() {
							room.removeLight(light);
							lnode.update();
						}, "up5 right"),
						light.opts.variety,
						CT.dom.div([
							"Color",
							color
						], "topbordered padded margined"),
						CT.dom.div([
							"Intensity",
							intensity
						], "topbordered padded margined")
					];
					if (light.opts.variety != "ambient") {
						var pos = light.position();
						content.push(CT.dom.div([
							_.lightdirs[light.opts.variety],
							CT.dom.div(["x", "y", "z"].map(function(dim, di) {
								return [
									dim,
									CT.dom.range(function(val) {
										light.thring.position[dim] = val;
										updater(i, "position", val, di, dim);
									}, -256, 256, pos[dim], 0.1, "w1")
								];
							}))
						], "topbordered padded margined"));
					}
					return CT.dom.div(content, "margined padded bordered round");
				})
			]);
		};
		return lnode;
	}
};