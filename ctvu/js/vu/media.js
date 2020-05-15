vu.media = {
	_: {
		types: {
			image: "img",
			background: "img"
		},
		bgz: ["background", "video", "iframe", "map", "panorama", "environment"],
		extra: { // pacdv
			audio: ["air_hum.wav", "airport-gate-1.mp3", "airplane-interior-1.mp3", "airport-security-1.mp3", "amusement-park.mp3", "bus-1.mp3", "caf-1.mp3", "caf-2.mp3", "car-interior-1.mp3", "c-p-1.mp3", "city-traffic-1.mp3", "c-c-1.mp3", "crowd_outside_1.wav", "crowd_outside_2.wav", "crowd_outside_3.wav", "crowd_outside_4.wav", "downtown-1.mp3", "downtown-2.mp3", "downtown-3.mp3", "e-s.mp3", "fast_food_joint_1.wav", "fire-1.mp3", "food_court.wav", "freeway-1.mp3", "freeway-2.mp3", "grocery_store_1.wav", "g-t-1.mp3", "hallway-crowd.mp3", "highway-1.mp3", "kids-playing-football.mp3", "kids-playing-football-2.mp3", "laundry_room_1.wav", "lobby_1.wav", "l-c-1.mp3", "l-c-2.mp3", "marketplace_1.wav", "marketplace_2.wav", "marketplace_3.wav", "metro-station-1.mp3", "o-c-1.mp3", "park_1.wav", "park_2.wav", "party_crowd_1.wav", "people-talking.mp3", "rain_1.mp3", "rain_2.wav", "rain_3.wav", "rain_4.wav", "rain-5.mp3", "rain-6.mp3", "restaurant_1.wav", "restaurant-2.mp3", "river-1.mp3", "river-2.mp3", "s-y.mp3", "s-w-1.mp3", "s-w-2.mp3", "shopping-mall-1.mp3", "store-paging.wav", "street-construction-1.mp3", "s-h.mp3", "street-traffic-1.mp3", "street-traffic-2.mp3", "water-fountain-1.mp3", "waterfall-1.mp3", "water-stream-1.mp3", "wind-breeze-1.mp3", "windy-forest-1.mp3"].map(function(a) {
				return {
					name: "pacdv: " + a.split(".")[0],
					variety: "audio",
					item: "https://www.pacdv.com/sounds/ambience_sounds/" + a
				};
			}),
			image: [216671, 966927, 2117937, 838981, 266643,
				3847498, 220182, 235986, 1227511, 3255761, 1022692,
				326311, 235994, 164005, 129733, 172289, 326333, 172292,
				129731, 163999, 139306, 172276, 172278, 207253].map(function(p, i) {
				var name = "Pexels " + ((i < 11) ? "Rock" : "Wood");
				name += " Texture (" + i + ")";
				return {
					name: name,
					variety: "image",
					item: "https://images.pexels.com/photos/" + p + "/pexels-photo-" + p + ".jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
				};
			})
		},
		isMap: function(sel) {
			return ["map", "panorama"].indexOf(sel) != -1;
		},
		isResource: function(sel) {
			return ["image", "background", "audio", "video"].indexOf(sel) != -1;
		},
		fetch: function(variety, cb) {
			var _ = vu.media._;
			if (_.resources)
				return cb(_.resources[variety]);
			CT.db.get("resource", function(rez) {
				var rz = _.resources = {};
				rez.forEach(function(r) {
					if (!(r.variety in rz))
						rz[r.variety] = [];
					rz[r.variety].push(r);
				});
				for (var v in _.extra)
					rz[v] = (rz[v] || []).concat(_.extra[v]);
				cb(rz[variety]);
			});
		}
	},
	checkBoxGate: function(obj, sel, node) {
		var bgz = vu.media._.bgz;
		return CT.dom.checkboxAndLabel(sel, !!obj[sel], null, null, null, function(cbox) {
			if (cbox.checked && (bgz.indexOf(sel) != -1)) {
				for (var i = 0; i < bgz.length; i++) {
					if (obj[bgz[i]]) {
						cbox.checked = false;
						return;
					}
				}
			}
			CT.dom.showHide(node, cbox.checked, !cbox.checked);
			if (!cbox.checked)
				delete obj[sel];
		});
	},
	browse: function(variety, cb) {
		vu.media._.fetch(variety, function(resources) {
			if (!resources)
				return alert("nothing yet -- add the first one!");
			CT.modal.choice({
				data: resources,
				cb: cb
			})
		});
	},
	viewer: function(node, opts, sel) {
		if (sel == "environment" || sel == "button") return;
		if (vu.media._.isMap(sel)) {
			node.classList.add("h100p");
			return zero.core.util[sel](opts.item, node);
		}
		CT.dom.setContent(node, CT.dom[vu.media._.types[sel] || sel]({
			src: opts.item,
			controls: true,
			className: "w1"
		}));
	},
	selector: function(rez, sel, cb, forceShow) {
		var isIframe = sel == "iframe",
			isMap = vu.media._.isMap(sel),
			opts = rez[sel] || {
				variety: sel,
				modelName: "resource",
				owners: [user.core.get("key")]
			}, item, blurs = core.config.ctvu.blurs;

		// viewer (img/audio)
		var viewer = CT.dom.div(null, "mt5");
		if (opts.item)
			vu.media.viewer(viewer, opts, sel);

		// item
		if (sel == "button") {
			var oi = opts.item = opts.item || {};
			item = CT.dom.div(["trigger", "className", "css"].map(function(part) {
				return CT.dom.smartField(function(val) {
					oi[part] = val;
					cb();
				}, "w1 block mt5", null, oi[part], null, blurs[part], part == "css");
			}), !opts.name && "hidden");
		} else if (sel == "environment") {
			item = CT.dom.select(core.config.ctvu.loaders.environments,
				null, null, opts.item && opts.item.environment, null, function(val) {
					opts.item = {
						environment: val,
						lights: core.config.ctzero.room.lights
					};
					cb();
				});
			if (!opts.item)
				item.className = "hidden";
		} else if (isMap) {
			var oi = opts.item = opts.item || {};
			item = CT.dom.div(["lat", "lng"].map(function(axis, i) {
				return CT.dom.smartField(function(val) {
					oi[axis] = parseFloat(val);
					item.lastElementChild.style.display = "block";
					if (oi.lat && oi.lng) {
						vu.media.viewer(viewer, opts, sel);
						cb();
					}
				}, "w1 block mt5" + ((i && !oi[axis]) ? " hidden" : ""),
					null, oi[axis], null, blurs[axis]);
			}), !opts.item.lat && "hidden");
		} else if (!isIframe) { // standard -- drag drop
			item = CT.dom.div(CT.file.dragdrop(function(ctfile) {
				ctfile.upload("/_db", function(url) {
					opts.item = url;
					vu.media.viewer(viewer, opts, sel);
					cb();
				}, {
					action: "blob",
					key: opts.key,
					property: "item"
				});
			}), !opts.item && "hidden");
		}

		var update = function(resource) {
			if (!(sel in rez))
				rez[sel] = opts;
			if (resource && resource.key)
				opts.key = resource.key;
			if (isIframe) {
				opts.item = val;
				vu.media.viewer(viewer, opts, sel);
			} else
				CT.dom.show(item);
			cb();
		};

		// name (required)
		var name = CT.dom.smartField(function(val) {
			if (!val) return name.blur();
			opts.name = val;
			if (isIframe || isMap || ["button", "environment"].indexOf(sel) != -1)
				return update();
			CT.net.post({
				path: "/_db",
				params: {
					action: "edit",
					pw: core.config.ctvu.storage.apikey,
					data: opts
				},
				cb: update
			});
		}, null, null, opts.name, null, blurs[sel] || blurs.resource);

		// media selector popup
		var browse = CT.dom.img("/img/vu/browse.png", "right h30p up5", function() {
			vu.media.browse(sel, function(res) {
				rez[sel] = opts = res;
				name.value = opts.name;
				vu.media.viewer(viewer, opts, sel);
				cb();
			});
		});
		if (!vu.media._.isResource(sel))
			CT.dom.hide(browse);

		return CT.dom.div([browse, name, item, viewer], !forceShow && !rez[sel] && "hidden");
	}
};