vu.builders.arcraft = {
	_: {
		selectors: {},
		menus: {
			basic: "topleft",
			markers: "topright",
			lights: "bottomleft"
		},
		augmentation: {
			video: function(t, cb) {
				return vu.media.selector(t, "video", function() {
					t.name = t.video.name;
					cb(t);
				}, true);
			},
			craft: function(cb) {
				var _ = vu.builders.arcraft._, vswarmz = templates.one.vswarm, options;
				CT.modal.choice({
					prompt: "what kind of augmentation?",
					data: ["thing", "video", "voxel swarm"], // TODO: primitives [w/ material controls]
					cb: function(variety) {
						if (variety == "video") {
							return cb({
								kind: "video",
								autoplay: true,
								planeGeometry: [2, 2],
								rotation: [Math.PI / 2, 0, 0],
								thringopts: {
									rotation: [-Math.PI / 2, 0, 0]
								}
							});
						}
						options = _[variety + "s"] || Object.keys(vswarmz);
						CT.modal.choice({
							prompt: "select something",
							data: options,
							cb: function(t) {
								cb(t.key || {
									name: t,
									kind: "swarm",
									thing: "Swarm",
									frames: vswarmz[t]
								});
							}
						});
					}
				});
			},
			controllers: function(t, cb) {
				var _ = vu.builders.arcraft._, nz = [
					CT.dom.link(t.name || "unnamed", () => _.thingup(t))
				];
				if (t.kind == "video")
					nz.push(_.augmentation.video(t, cb));
				return nz;
			}
		},
		marker: {
			pattern: ["hiro", "kanji"],
			barcode: [0, 1, 2, 3, 4, 5, 6, 7],
			up: function() {
				var _ = vu.builders.arcraft._;
				vu.storage.edit({
					key: _.aug.key,
					markers: _.aug.markers
				});
			},
			anchor: function(cb) {
				var _ = vu.builders.arcraft._, m = _.marker;
				CT.modal.choice({
					prompt: "what kind of marker?",
					data: ["pattern", "barcode"], // TODO: custom
					cb: function(variety) {
						CT.modal.choice({
							prompt: "what kind of " + variety + "?",
							data: m[variety],
							cb: cb
						});
					}
				});
			},
			craft: function() {
				var _ = vu.builders.arcraft._;
				_.marker.anchor(function(marker) {
					_.augmentation.craft(function(aug) {
						_.aug.markers[marker] = aug;
						_.marker.up();
						_.selectors.markers.update();
					});
				});
			},
			list: function() {
				var _ = vu.builders.arcraft._, t, i;
				return Object.keys(_.aug.markers).map(function(m) {
					t = _.aug.markers[m];
					if (typeof t == "string")
						t = _.thinkeys[t];
					i = "/ardata/" + m + ".png";
					return CT.dom.div([
						CT.dom.button("remove", function() {
							delete _.aug.markers[m];
							vu.storage.edit({
								key: _.aug.key,
								markers: _.aug.markers
							});
							_.selectors.markers.update();
						}, "right"),
						CT.dom.link(m, null, i, "bold", null, null, true),
						CT.dom.img(i, "block w100p"),
						_.augmentation.controllers(t, _.marker.up)
					], "bordered padded margined round");
				});
			}
		},
		generators: {
			basic: function() {
				var alink, qn, n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.update = function() {
					alink = "/vu/ar.html#" + _.aug.key;
					qn = CT.dom.div();
					new QRCode(qn, alink);
					CT.dom.setContent(n, [ qn, CT.dom.link(_.aug.name, null, alink) ]);
				};
				return n;
			},
			markers: function() {
				var n = CT.dom.div(), m = vu.builders.arcraft._.marker;
				n.update = function() { // hiro/kanji/0-7 -> thing/vswarm/primitive
					CT.dom.setContent(n, [
						CT.dom.button("add", m.craft, "up20 right"),
						m.list()
					]);
				};
				return n;
			},
			lights: function() {
				var n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.controls = vu.party.lights(_.lightup, true);
				n.appendChild(n.controls);
				n.update = function() {
					zero.core.current.room.setLights(_.aug.lights, n.controls.update);
				};
				return n;
			}
		},
		thingup: function(t) {
			var _ = vu.builders.arcraft._, r = zero.core.current.room;
			_.thing && r.removeObject(_.thing);
			_.thing = r.addObject(t);
		},
		lightup: function(lnum, property, val, subprop) {
			var _ = vu.builders.arcraft._, alz = _.aug.lights,
				lig, rlz = zero.core.current.room.opts.lights;
			if (alz.length != rlz.length)
				alz = _.aug.lights = rlz;
			else if (property) {
				lig = _.aug.lights[lnum];
				if (subprop != undefined)
					lig[property][subprop] = val;
				else
					lig[property] = val;
			}
			vu.storage.edit({
				key: _.aug.key,
				lights: _.aug.lights
			});
		},
		setup: function() {
			var _ = vu.builders.arcraft._, genz = _.generators, section;
			for (section in genz)
				_.selectors[section] = genz[section]();
		},
		load: function(aug) {
			var _ = vu.builders.arcraft._, selz = _.selectors;
			_.aug = aug;
			_.sharer.update(aug);
			CT.dom.setContent(_.curname, aug.name);
			selz.basic.update();
			selz.markers.update();
			selz.lights.update();
		},
		swap: function() {
			var _ = vu.builders.arcraft._;
			CT.modal.choice({
				prompt: "select augmentation",
				data: [{ name: "new augmentation" }].concat(_.augs),
				cb: function(aug) {
					if (aug.name == "new augmentation")
						return _.craft();
					_.load(aug);
				}
			});
		},
		craft: function() {
			var _ = vu.builders.arcraft._;
			CT.modal.prompt({
				prompt: "what's the new augmentation's name?",
				cb: function(name) {
					vu.core.v({
						action: "augmentation",
						owners: [user.core.get("key")],
						name: name
					}, function(item) {
						_.augs.push(item);
						_.load(item);
					});
				}
			});
		},
		start: function() {
			var _ = vu.builders.arcraft._;
			if (!_.augs || !_.things) return; // wait for other thing to load...
			if (_.augs.length)
				zero.core.current.room.onReady(() => _.load(_.augs[0]));
			else
				_.craft();
		},
		getAugmentations: function() {
			var _ = vu.builders.arcraft._;
			CT.db.get("augmentation", function(augs) {
				_.augs = augs;
				_.start();
			}, 1000, null, null, {
				owners: {
					comparator: "contains",
					value: user.core.get("key")
				}
			}, null, null, "json");
		},
		getThings: function() {
			var _ = vu.builders.arcraft._;
			CT.db.get("thing", function(things) {
				_.things = things;
				_.thinkeys = {};
				things.forEach(function(t) {
					_.thinkeys[t.key] = t;
				});
				_.start();
			}, 1000, null, null, null, null, null, "json");
		},
		linx: function() {
			var _ = vu.builders.arcraft._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			_.getAugmentations();
			_.getThings();
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.swap),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		}
	},
	menus: function() {
		var section, _ = vu.builders.arcraft._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};