vu.media = {
	_: {
		types: {
			image: "img",
			background: "img"
		},
		bgz: ["background", "video", "iframe", "map", "panorama", "environment"],
		extra: { // pacdv
			audio: ["air_hum.wav", "airport-gate-1.mp3", "airplane-interior-1.mp3", "airport-security-1.mp3", "amusement-park.mp3", "bus-1.mp3", "caf-1.mp3", "caf-2.mp3", "car-interior-1.mp3", "c-p-1.mp3", "city-traffic-1.mp3", "c-c-1.mp3", "crowd_outside_1.wav", "crowd_outside_2.wav", "crowd_outside_3.wav", "crowd_outside_4.wav", "downtown-1.mp3", "downtown-2.mp3", "downtown-3.mp3", "e-s.mp3", "fast_food_joint_1.wav", "fire-1.mp3", "food_court.wav", "freeway-1.mp3", "freeway-2.mp3", "grocery_store_1.wav", "g-t-1.mp3", "hallway-crowd.mp3", "highway-1.mp3", "kids-playing-football.mp3", "kids-playing-football-2.mp3", "laundry_room_1.wav", "lobby_1.wav", "l-c-1.mp3", "l-c-2.mp3", "marketplace_1.wav", "marketplace_2.wav", "marketplace_3.wav", "metro-station-1.mp3", "o-c-1.mp3", "park_1.wav", "park_2.wav", "party_crowd_1.wav", "people-talking.mp3", "rain_1.mp3", "rain_2.wav", "rain_3.wav", "rain_4.wav", "rain-5.mp3", "rain-6.mp3", "restaurant_1.wav", "restaurant-2.mp3", "river-1.mp3", "river-2.mp3", "s-y.mp3", "s-w-1.mp3", "s-w-2.mp3", "shopping-mall-1.mp3", "store-paging.wav", "street-construction-1.mp3", "s-h.mp3", "street-traffic-1.mp3", "street-traffic-2.mp3", "water-fountain-1.mp3", "waterfall-1.mp3", "water-stream-1.mp3", "wind-breeze-1.mp3", "windy-forest-1.mp3"
			].map(function(a) {
				return {
					name: "pacdv: " + a.split(".")[0],
					variety: "audio",
					item: "https://www.pacdv.com/sounds/ambience_sounds/" + a
				};
			}),
			background: [216671, 966927, 2117937, 838981, 266643,
				3847498, 220182, 235986, 1227511, 3255761, 1022692,
				326311, 235994, 164005, 129733, 172289, 326333, 172292,
				129731, 163999, 139306, 172276, 172278, 207253
			].map(function(p, i) {
				var name = "Pexels " + ((i < 11) ? "Rock" : "Wood");
				name += " Texture (" + i + ")";
				return {
					name: name,
					variety: "image",
					item: "https://images.pexels.com/photos/" + p + "/pexels-photo-" + p + ".jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
				};
			}),
			image: [
				"bg7.jpg", "bgBITZs4a.jpg", "bg_yan3.jpg", "bod.jpg",
				"bunny_ears.jpg", "bunny_teeth.jpg", "eye_brown_basic.jpg",
				"graph_paper.jpg", "hair_alphaGimp3_2SMALL.png",
				"hair_alphaGimp3a.png", "hairC5dHat.png", "hair.png",
				"hairShrunk.png", "head.jpg", "head_UV2.jpg", "icon.jpg",
				"room1.jpg", "shirt.jpg", "teeth256s.jpg", "white.jpg"
			].map(function(o) {
				return {
					name: "ctone: " + o.split(".")[0],
					variety: "image",
					item: "/maps/one/" + o
				};
			})
		},
		isMap: function(sel) {
			return ["map", "panorama"].indexOf(sel) != -1;
		},
		isResource: function(sel) {
			return ["image", "background", "audio", "video"].indexOf(sel) != -1;
		},
		initRes: function(r) {
			var rz = vu.media._.resources;
			if (!(r.variety in rz))
				rz[r.variety] = [];
			rz[r.variety].push(r);
		}
	},
	init: function(cb) {
		var _ = vu.media._, loader = function() {
			if (!(_.resources && _.textures)) return;
			cb && cb();
			return true;
		};
		if (loader()) return;
		CT.db.get("asset", function(assets) {
			var tz = _.textures = { all: [] }, ass;
			for (ass of assets) {
				tz[ass.kind] = tz[ass.kind] || [];
				tz[ass.kind].push(ass);
				tz.all.push(ass);
			}
			loader();
		}, null, null, null, {
			variety: "texture"
		});
		CT.db.get("resource", function(rez) {
			var rz = _.resources = {};
			rez.forEach(_.initRes);
			for (var v in _.extra)
				rz[v] = (rz[v] || []).concat(_.extra[v]);
			loader();
		}, null, null, null, null, null, null, "json");
	},
	fetch: function(variety, cb) {
		vu.media.init(function() {
			cb(vu.media._.resources[variety]);
		});
	},
	txprompt: function(cb, data) {
		CT.modal.prompt({
			prompt: "please select a texture",
			style: "icon",
			recenter: true,
			className: "basicpopup mosthigh galimg",
			data: data,
			cb: cb
		});
	},
	recprompt: function(cb, hasRec) {
		if (!hasRec) return cb("all");
		CT.modal.choice({
			prompt: "want to see all options or just our recommendations?",
			data: ["all", "recommendations"],
			cb: cb
		});
	},
	texture: function(cb, variety, kind, reqkey) { // image, background, texture
		var _ = vu.media._;
		if (reqkey) {
			var origcb = cb;
			cb = function(tx) {
				if (tx.key) return origcb(tx);
				vu.core.v({
					action: "resource",
					kind: kind,
					url: tx.item,
					name: tx.name,
					variety: tx.variety
				}, origcb);
			};
		}
		vu.media.init(function() {
			var rz = _.resources, tz = _.textures;
			if (kind) { // asset...
				vu.media.recprompt(function(subset) {
					if (subset != "all")
						return vu.media.txprompt(cb, tz[kind]);
					vu.media.txprompt(cb, // assets (textures) first
						tz.all.concat(rz.image).concat(rz.background));
					
				}, tz[kind]);
			} else { // resource - image or background
				vu.media.recprompt(function(subset) {
					if (subset != "all")
						return vu.media.txprompt(cb, rz[variety]);
					if (variety == "image")
						vu.media.txprompt(cb, // variety first
							rz.image.concat(rz.background).concat(tz.all));
					else // background
						vu.media.txprompt(cb, // variety first
							rz.background.concat(rz.image).concat(tz.all));
				}, rz[variety]);
			}
		});
	},
	swapper: function(target, cb) {
		return CT.dom.link("swap", function() {
			vu.media.texture(function(tx) {
				target.update({ texture: tx.item });
				cb(tx.item);
			}, null, target.opts.kind);
		});
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
		vu.media.fetch(variety, function(resources) {
			if (["image", "background"].includes(variety))
				return vu.media.texture(cb, variety);
			if (!resources)
				return alert("nothing yet -- add the first one!");
			var oz = {
				data: resources,
				cb: cb
			};
			if (variety == "audio")
				oz.style = "sound";
			CT.modal.choice(oz);
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
		var _ = vu.media._, isMap = _.isMap(sel),
			isIframe = sel == "iframe",
			opts = rez[sel] || {
				variety: sel,
				modelName: "resource",
				owners: [user.core.get("key")]
			}, item, blurs = core.config.ctvu.blurs;

		if (sel == "audio")
			opts.kind = "event";

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
			vu.storage.edit(opts, function(ent) {
				_.initRes(ent);
				update(ent);
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
		if (!_.isResource(sel))
			CT.dom.hide(browse);

		return CT.dom.div([browse, name, item, viewer], !forceShow && !rez[sel] && "hidden");
	}
};