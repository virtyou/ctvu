vu.builders.arcraft = {
	_: {
		selectors: {},
		menus: {
			loader: "topleft",
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
			program: function(t, cb) {
				return CT.dom.link("select", function() {
					zero.core.util.vidProg(function(v) {
						t.name = v.split("/").pop();
						t.video = v;
						cb(t);
					});
				}, null, "block hoverglow");
			},
			craft: function(cb) {
				var _ = vu.builders.arcraft._, zcar = zero.core.ar, options;
				CT.modal.choice({
					prompt: "what kind of augmentation?", // TODO: primitives [w/ material controls]
					data: ["person", "thing", "video", "program", "swarm"],
					cb: function(kind) {
						if (zero.core.ar.viddy(kind))
							return zcar.item(kind);
						options = _[kind + "s"] || Object.keys(templates.one.vswarm);
						if (kind == "person")
							options = ["random"].concat(options);
						CT.modal.choice({
							prompt: "select something",
							data: options,
							cb: cb(zcar.item(kind, t))
						});
					}
				});
			},
			controllers: function(t, cb) {
				var _ = vu.builders.arcraft._, nz = [
					CT.dom.link(t.kind + ": " + (t.name || t.person || "unnamed"),
						() => _.thingup(t)) // TODO : something sensible...
				];
				zero.core.ar.viddy(t.kind) && nz.push(_.augmentation[t.kind](t, cb));
				return nz;
			}
		},
		modes: {
			anchors: function(cb) {
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
			location: function(cb) {
				confirm("press OK to set location") && navigator.geolocation.getCurrentPosition(pos => cb({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude
				}), () => alert("error geolocating :("));
			},
			relocation: function(cb) {
				var _ = vu.builders.arcraft._, rel = _.aug.relative, lat, lng;
				_.modes.location(function(latlng) {
					lat = latlng.latitude - rel.latitude;
					lng = latlng.longitude - rel.longitude;
					if (lat || lng)
						return cb({ latitude: lat, longitude: lng });
					_.reloc(cb);
				});
			}
		},
		marker: {
			pattern: ["hiro", "kanji"],
			barcode: [0, 1, 2, 3, 4, 5, 6, 7],
			up: function() {
				var _ = vu.builders.arcraft._, eobj = {
					key: _.aug.key
				};
				eobj[_.isloc ? "things" : "markers"] = _.items;
				vu.storage.edit(eobj);
			},
			anchor: function(cb) {
				var _ = vu.builders.arcraft._;
				_.modes[_.mode](cb);
			},
			locater: function(t) {
				var _ = vu.builders.arcraft._, n = CT.dom.link(null, function() {
					_.reloc(function(latlng) {
						t.latitude = latlng.latitude;
						t.longitude = latlng.longitude;
						_.marker.up();
						n.update();
					});
				});
				n.update = function() {
					CT.dom.setContent(n, [
						"latitude: " + t.latitude,
						"longitude: " + t.longitude
					]);
				};
				n.update();
				return n;
			},
			craft: function() {
				var _ = vu.builders.arcraft._;
				_.marker.anchor(function(marker) {
					_.augmentation.craft(function(aug) {
						if (_.isloc) {
							aug.longitude = marker.longitude;
							aug.latitude = marker.latitude;
							_.items.push(aug);
						} else
							_.items[marker] = aug;
						_.marker.up();
						_.selectors.markers.update();
					});
				});
			},
			item: function(m) {
				var _ = vu.builders.arcraft._, t = _.items[m], cont = [], i;
				if (typeof t == "string")
					t = _.thinkeys[t];
				else if (t.justkey)
					t = CT.merge(t, _.thinkeys[t.justkey]);
				cont.push(CT.dom.button("remove", function() {
					if (_.isloc)
						_.items.splice(m, 1);
					else
						delete _.items[m];
					_.marker.up();
					_.selectors.markers.update();
				}, "right"));
				if (_.isloc)
					cont.push(_.marker.locater(t));
				else {
					i = "/ardata/" + m + ".png";
					cont.push([
						CT.dom.link(m, null, i, "bold", null, null, true),
						CT.dom.img(i, "block w100p")
					]);
				}
				cont.push(_.augmentation.controllers(t, _.marker.up));
				return CT.dom.div(cont, "bordered padded margined round");
			},
			list: function() {
				var _ = vu.builders.arcraft._;
				return Object.keys(_.items).map(_.marker.item);
			}
		},
		generators: {
			loader: function() {
				var alink, qn, n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.update = function() {
					alink = location.protocol + "//" + location.host + "/vu/ar.html#" + _.aug.key;
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
		offset: function(name, cb) {
			var unit = zero.core.ar.unit, max = unit * 10;
			CT.modal.prompt({
				prompt: name + " offset",
				classname: "w400p",
				style: "number",
				initial: unit,
				step: unit,
				min: -max,
				max: max,
				cb: cb
			})
		},
		reloc: function(cb) {
			var _ = vu.builders.arcraft._;
			_.offset("latitude", function(lat) {
				_.offset("longitude", function(lng) {
					cb({ latitude: lat, longitude: lng });
				});
			});
		},
		thingup: function(t) {
			var _ = vu.builders.arcraft._, r = zero.core.current.room;
			_.thing && r.removeObject(_.thing);
			if (t.kind != "video") {
				t.onbound = zero.core.util.fit;
				t.scale = [1, 1, 1];
				t.centered = true;
			}
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
			_.mode = aug.variety;
			_.isloc = _.mode.endsWith("location");
			_.items = aug[_.isloc ? "things" : "markers"];
			(_.mode == "relocation") && _.modes.location(function(latlng) {
				_.aug.relative = latlng;
			});
			_.sharer.update(aug);
			CT.dom.setContent(_.curname, aug.name);
			selz.loader.update();
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
			CT.modal.choice({
				prompt: "anchor or location or relative location based?",
				data: ["anchors", "location", "relocation"],
				cb: function(variety) {
					CT.modal.prompt({
						prompt: "what's the new augmentation's name?",
						cb: function(name) {
							vu.core.v({
								action: "augmentation",
								owners: [user.core.get("key")],
								name: name,
								variety: variety
							}, function(item) {
								_.augs.push(item);
								_.load(item);
							});
						}
					});
				}
			});
		},
		start: function() {
			var _ = vu.builders.arcraft._;
			if (!_.augs || !_.things || !_.persons) return; // wait for other thing to load...
			if (_.augs.length)
				zero.core.current.room.onReady(() => _.load(_.augs[0]));
			else
				_.craft();
		},
		getAugmentations: function() {
			var _ = vu.builders.arcraft._;
			vu.core.my("augmentation", function(augs) {
				_.augs = augs;
				_.start();
			}, "json");
		},
		getThings: function() {
			var _ = vu.builders.arcraft._;
			vu.core.all("thing", function(things) {
				_.things = things;
				_.thinkeys = {};
				things.forEach(function(t) {
					_.thinkeys[t.key] = t;
				});
				_.start();
			}, "json");
		},
		getPersons: function() {
			var _ = vu.builders.arcraft._;
			vu.core.all("person", function(pers) {
				_.persons = pers;
				_.start();
			}, "json");
		},
		linx: function() {
			var _ = vu.builders.arcraft._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			_.getAugmentations();
			_.getPersons();
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