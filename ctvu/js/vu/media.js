vu.media = {
	_: {
		types: {
			image: "img",
			background: "img"
		},
		bgz: ["background", "video", "iframe", "map", "panorama", "environment"],
		audio: {
			ambient: ["air_hum.wav", "airport-gate-1.mp3", "airplane-interior-1.mp3", "airport-security-1.mp3", "amusement-park.mp3", "bus-1.mp3", "caf-1.mp3", "caf-2.mp3", "car-interior-1.mp3", "c-p-1.mp3", "city-traffic-1.mp3", "c-c-1.mp3", "crowd_outside_1.wav", "crowd_outside_2.wav", "crowd_outside_3.wav", "crowd_outside_4.wav", "downtown-1.mp3", "downtown-2.mp3", "downtown-3.mp3", "e-s.mp3", "fast_food_joint_1.wav", "fire-1.mp3", "food_court.wav", "freeway-1.mp3", "freeway-2.mp3", "grocery_store_1.wav", "g-t-1.mp3", "hallway-crowd.mp3", "highway-1.mp3", "kids-playing-football.mp3", "kids-playing-football-2.mp3", "laundry_room_1.wav", "lobby_1.wav", "l-c-1.mp3", "l-c-2.mp3", "marketplace_1.wav", "marketplace_2.wav", "marketplace_3.wav", "metro-station-1.mp3", "o-c-1.mp3", "park_1.wav", "park_2.wav", "party_crowd_1.wav", "people-talking.mp3", "rain_1.mp3", "rain_2.wav", "rain_3.wav", "rain_4.wav", "rain-5.mp3", "rain-6.mp3", "restaurant_1.wav", "restaurant-2.mp3", "river-1.mp3", "river-2.mp3", "s-y.mp3", "s-w-1.mp3", "s-w-2.mp3", "shopping-mall-1.mp3", "store-paging.wav", "street-construction-1.mp3", "s-h.mp3", "street-traffic-1.mp3", "street-traffic-2.mp3", "water-fountain-1.mp3", "waterfall-1.mp3", "water-stream-1.mp3", "wind-breeze-1.mp3", "windy-forest-1.mp3"
			].map(function(a) {
				return {
					name: "pacdv: " + a.split(".")[0],
					variety: "audio",
					kind: "ambient",
					item: "https://www.pacdv.com/sounds/ambience_sounds/" + a
				};
			}),
			music: ["Rolemusic/Rolemusic_-_Singles/Rolemusic_-_the_river.mp3","Rolemusic/Rolemusic_-_Singles/Rolemusic_-_Omou_matsu.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_09_-_Towel_Defence_Sad_Ending.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_10_-_Towel_Defence_Ending.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_04_-_Towel_Defence_Ingame_Action.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_08_-_Towel_Defence_Press_Roll.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_07_-_Towel_Defence_Jingle_Win.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_06_-_Towel_Defence_Jingle_Loose.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_01_-_Towel_Defence_Splash_Screen.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_05_-_Towel_Defence_Block_Bonus.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_03_-_Towel_Defence_Ingame.mp3","sawsquarenoise/Towel_Defence_OST/sawsquarenoise_-_02_-_Towel_Defence_Comic.mp3","Rolemusic/Rolemusic_-_Singles/Rolemusic_-_Shaanti.mp3","Rolemusic/Rolemusic_-_Singles/Rolemusic_-_w1x.mp3","Creo/Creo_-_Singles/Creo_-_01_-_Place_on_Fire.mp3","Rolemusic/Rolemusic_-_Singles/Rolemusic_-_02_-_May.mp3","Rolemusic/Rolemusic_-_Singles/Rolemusic_-_Step_to_Space.mp3","Captive_Portal/Toy_Sounds_Vol_1/Captive_Portal_-_04_-_A_Candy_Addiction.mp3","Captive_Portal/Toy_Sounds_Vol_1/Captive_Portal_-_03_-_An_Example_For.mp3","Captive_Portal/Toy_Sounds_Vol_1/Captive_Portal_-_02_-_Me_As.mp3"
			].map(function(m) {
				return {
					name: "freemusicarchive: " + m.split("-").pop().split(".")[0],
					variety: "audio",
					kind: "music",
					item: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/" + m
				};
			}),
			fx: ["Cartoon Chipmunk Riser Toy Sound Effect", "Cartoon Dizzy Fall A Sound Effect", "Cartoon Dizzy Fall B Sound Effect", "Cartoon Dizzy Rising A Sound Effect", "Cartoon Fail A Sound Effect", "Cartoon Fall A Sound Effect", "Cartoon Funny Rise A Sound Effect", "Cartoon Funny Rise B Sound Effect", "Cartoon Happy Trill A Sound Effect", "Cartoon Happy Trill B Sound Effect", "Cartoon Happy Trill Sound Effect", "Cartoon Jumpy B Sound Effect", "Cartoon Jumpy Sound Effect", "Cartoon Laser A Sound Effect", "Cartoon Riser A Sound Effect", "Cartoon Short Fall A Sound Effect", "Cartoon Short Fall B Sound Effect", "Cartoon Short Rise A Sound Effect", "Cartoon Short Rise B Sound Effect", "Cartoon Slip A Sound Effect", "Cartoon Slip B Sound Effect", "Cartoon Slip Sound Effect", "Cartoon Squirrely A Sound Effect", "Cartoon Squirrely B Sound Effect", "Cartoon Suspenseful Trill A Sound Effect", "Cartoon Suspenseful Trill B Sound Effect", "Cartoon Suspenseful Trill Sound Effect", "Cartoon Whistle Fall A Sound Effect", "Cartoon Whistle Fall B Sound Effect", "Cartoon Whistle Up Sound Effect", "Cartoon Zoink A Sound Effect"
			].map(function(e, i) {
				return {
					name: "fesliyanstudios: " + e,
					variety: "audio",
					kind: "fx",
					item: "https://www.fesliyanstudios.com/soundeffects-download.php?id=" + (i + 7001)
				};
			})
		},
		images: {
			background: [216671, 966927, 2117937, 838981, 266643,
				3847498, 220182, 235986, 1227511, 3255761, 1022692,
				326311, 235994, 164005, 129733, 172289, 326333, 172292,
				129731, 163999, 139306, 172276, 172278, 207253
			].map(function(p, i) {
				var name = "Pexels " + ((i < 11) ? "Rock" : "Wood");
				name += " Texture (" + i + ")";
				return {
					name: name,
					variety: "background",
					item: "https://images.pexels.com/photos/" + p + "/pexels-photo-" + p + ".jpeg"
				};
			}),
			image: [
				"bg7.jpg", "bgBITZs4a.jpg", "bg_yan3.jpg", "bluefab.jpg", "bod.jpg",
				"bunny_ears.jpg", "bunny_teeth.jpg", "cloth.jpg", "eye_brown_basic.jpg",
				"graph_paper.jpg", "grid.png", "hair_alphaGimp3_2SMALL.png",
				"hair_alphaGimp3a.png", "hairC5dHat.png", "hair.png",
				"hairShrunk.png", "head.jpg", "head_UV2.jpg", "hole.png", "icon.jpg",
				"leaves.jpg", "loop.jpg", "rock.jpg", "rock2.jpg", "rock3.jpg", "rock4.jpg",
				"rock5.jpg", "rock6.jpg", "room1.jpg", "rug1.jpg", "rug2.jpg", "rug3.jpg",
				"rug4.jpg", "rug5.jpg", "shirt.jpg", "sky-day.jpg", "sky-night.png",
				"stonestairs.png", "stonewall.jpg", "teeth256s.jpg", "white.jpg", "window.png"
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
			if (r.kind) {
				if (!(r.kind in rz))
					rz[r.kind] = [];
				rz[r.kind].push(r);
			}
		}
	},
	prompt: {
		adjusters: function(cb, part, variety, bz, unit, ondone) {
			unit = unit || 0.01;
			bz = bz || { // move somewhere else
				scale: {
					min: 0.2,
					max: 16
				},
				rotation: {
					min: -Math.PI,
					max: Math.PI
				},
				position: {
					min: -30,
					max: 30
				}
			}[variety], cur = part[variety](), upobj = {};
			upobj[variety] = [cur.x, cur.y, cur.z];
			CT.modal.modal(CT.dom.div([
				part.name + " - " + variety,
				["x", "y", "z"].map(function(axis, i) {
					return [
						axis,
						CT.dom.range(function(val) {
							var fval = upobj[variety][i] = parseFloat(val);
							part.adjust(variety, axis, fval);
							cb && cb(upobj);
						}, bz.min[axis] || bz.min, bz.max[axis] || bz.max, cur[axis], unit, "w1")
					];
				})
			], "centered padded"), ondone);
		},
		part: function(cb, kind, base, side, sub, part) { // worn/held!!
			var oz = {
				modelName: "part",
				base: base.key
			}, bone = zero.core.util.gear2bone(kind, side, sub, part);
			if (bone != undefined)
				oz.opts = { bone: bone };
			if (base.template) {
				oz.template = base.template;
				oz.opts = CT.merge({
					name: base.name,
					kind: base.kind,
					thing: base.thing
				}, oz.opts);
			}
			vu.storage.edit(oz, cb);
		},
		thing: function(cb, kind, part, side, sub, partname, genkind) {
			var up = function(thopts) {
				var eoz = thopts.key ? {
					base: thopts.key,
					template: null,
					opts: {}
				} : {
					base: null,
					template: thopts.template,
					opts: {
						name: thopts.name,
						kind: thopts.kind,
						thing: thopts.thing
					}
				};
				if (kind == "hair") // clear opts!
					eoz.opts = null;
				part ? vu.storage.edit(CT.merge({
					key: part.opts.key
				}, eoz), function(uppedpart) {
					CT.data.add(uppedpart, true);
					cb(uppedpart);
				}) : vu.media.prompt.part(cb,
					kind, thopts, side, sub, partname);
			}, imap = vu.storage.get(genkind || kind),
				items = imap && Object.values(imap);
			if (kind == "held" || kind.startsWith("worn_"))
				items = (items || []).concat(zero.base.clothes.procedurals(genkind || kind));
			if (!items || !items.length)
				return alert("oops, nothing yet! add the first " + kind + " thing on the item page!");
			if (false) { // fix 3d menus 1st...
				var m = new zero.core.Menu({
					items: items,
					onselect: function(thopts) {
						m.close();
						up(thopts);
					}
				});
			} else {
				CT.modal.choice({
					data: items,
					cb: up
				});
			}
		},
		tx: function(cb, data) {
			CT.modal.prompt({
				prompt: "please select a texture",
				style: "icon",
				recenter: true,
				className: "basicpopup mosthigh galimg",
				data: data,
				cb: cb
			});
		},
		aud: function(cb, data) {
			CT.modal.prompt({
				prompt: "please select a clip",
				style: "sound",
				data: data,
				cb: cb
			});
		},
		rec: function(cb, hasRec) {
			if (!hasRec) return cb("all");
			CT.modal.choice({
				prompt: "want to see all options or just our recommendations?",
				data: ["all", "recommendations"],
				cb: cb
			});
		},
		bu: function(cb) {
			CT.modal.choice({
				data: ["browse", "upload"],
				cb: cb
			});
		},
		file: function(cb, opts) {
			CT.modal.prompt({
				style: "file",
				cb: function(ctfile) {
					ctfile.upload("/_vu", cb, CT.merge(opts, {
						name: ctfile.name()
					}));
				}
			});
		},
		ofile: function(cb, mtype, variety, kind) {
			vu.media.prompt.file(cb, {
				action: mtype,
				variety: variety,
				kind: kind,
				owner: user.core.get("key")
			});
		},
		asset: function(cb, variety, kind) {
			vu.media.prompt.ofile(cb, "asset",
				variety, kind);
		},
		resource: function(cb, variety, kind) {
			vu.media.prompt.ofile(cb, "resource",
				variety, kind);
		}
	},
	swapper: {
		texture: function(target, cb, trigger) {
			var up = function(tx) {
				target.setTexture(tx.item);
				cb(tx);
			};
			var swap = function() {
				vu.media.prompt.bu(function(which) {
					if (which == "browse")
						return vu.media.texture(up,
							null, target.opts.kind, true);
					vu.media.prompt.asset(up,
						"texture", target.opts.kind);
				});
			};
			trigger && swap();
			return CT.dom.link("swap", swap);
		},
		texmo: function(item, cb, fulltx, fulltxcb) {
			var iup = function(img) {
				item.setTexture(img.item);
				tname(img.item);
				cb({ texture: fulltx && img || img.item, vstrip: null });
				fulltxcb && fulltxcb(img);
			}, tlink = CT.dom.link("no texture", function() {
				CT.modal.choice({
					prompt: "image or moving picture?",
					data: ["image", "moving picture"],
					cb: function(sel) {
						if (sel == "image") {
							vu.media.prompt.bu(function(which) {
								if (which == "browse")
									return (fulltx || fulltxcb) ? vu.media.texture(iup, null,
										item.opts.kind, true) : vu.media.browse("background", iup);
								vu.media.prompt.asset(iup, "texture", item.opts.kind);
							});
						} else {
							var vidz = CT.module("templates.one.vstrip");
							CT.modal.choice({
								prompt: "select a moving picture",
								data: Object.keys(vidz),
								cb: function(vsel) {
									var d = vidz[vsel];
									item.update({
										vstrip: d
									});
									tname(d.texture);
									cb({
										vstrip: d,
										texture: null
									});
								}
							});
						}
					}
				});
			}, null, "small right clearnode"), tname = function(tx) {
				tlink.innerHTML = tx.split("/").pop().split(".").shift();
			};
			item.opts.texture && tname(item.opts.texture);
			return tlink;
		},
		audio: function(cb, kind, reqkey) {
			vu.media.prompt.bu(function(which) {
				if (which == "browse")
					return vu.media.audio(cb,
						kind, reqkey);
				vu.media.prompt.resource(cb,
					"audio", kind);
			});
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
		}, 1000, null, null, {
			variety: "texture"
		});
		CT.db.get("resource", function(rez) {
			var rz = _.resources = {};
			rez.forEach(_.initRes);
			for (var sec of ["audio", "images"]) {
				for (var sub in _[sec]) {
					rz[sec] = (rz[sec] || []).concat(_[sec][sub]);
					rz[sub] = (rz[sub] || []).concat(_[sec][sub]);
				}
			}
			loader();
		}, 1000, null, null, null, null, null, "json");
	},
	fetch: function(variety, cb) {
		vu.media.init(function() {
			cb(vu.media._.resources[variety]);
		});
	},
	resourcer: function(cb, kind) {
		return function(tx) {
			if (tx.key) return cb(tx);
			vu.core.v({
				action: "resource",
				url: tx.item,
				name: tx.name,
				variety: tx.variety,
				kind: kind || tx.kind
			}, cb);
		};
	},
	texture: function(cb, variety, kind, reqkey) { // image, background, texture
		var _ = vu.media._;
		if (reqkey)
			cb = vu.media.resourcer(cb, kind);
		vu.media.init(function() {
			var rz = _.resources, tz = _.textures;
			if (kind) { // asset...
				vu.media.prompt.rec(function(subset) {
					if (subset != "all")
						return vu.media.prompt.tx(cb, tz[kind]);
					vu.media.prompt.tx(cb, // assets (textures) first
						tz.all.concat(rz.image).concat(rz.background));
				}, tz[kind]);
			} else { // resource - image or background
				vu.media.prompt.rec(function(subset) {
					if (subset != "all")
						return vu.media.prompt.tx(cb, rz[variety]);
					if (variety == "image")
						vu.media.prompt.tx(cb, // variety first
							rz.image.concat(rz.background).concat(tz.all));
					else // background
						vu.media.prompt.tx(cb, // variety first
							rz.background.concat(rz.image).concat(tz.all));
				}, rz[variety]);
			}
		});
	},
	audio: function(cb, kind, reqkey) { // music, ambient, fx
		var _ = vu.media._;
		kind = kind || "fx";
		if (reqkey)
			cb = vu.media.resourcer(cb, kind);
		vu.media.init(function() {
			var rz = _.resources;
			vu.media.prompt.rec(function(subset) {
				if (subset != "all")
					return vu.media.prompt.aud(cb, rz[kind]);
				vu.media.prompt.aud(cb, rz.audio);
			}, rz[kind]);
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
	browse: function(variety, cb, kind, reqkey) {
		vu.media.fetch(variety, function(resources) {
			if (["image", "background"].includes(variety))
				return vu.media.texture(cb, variety, reqkey);
			if (variety == "audio")
				return vu.media.audio(cb, kind, reqkey);
			if (!resources)
				return alert("nothing yet -- add the first one!");
			CT.modal.choice({
				data: resources,
				cb: cb
			});
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
			opts.kind = "fx";

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
				ctfile.upload("/_vu", function(ent) {
					Object.assign(opts, ent);
					name.value = opts.name;
					vu.media.viewer(viewer, opts, sel);
					cb();
				}, {
					action: "resource",
					key: opts.key
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