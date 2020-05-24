vu.builders.item = {
	_: {
		loaders: ["3MF", "AMF", "AssimpJSON", "Assimp", "AWD", "Babylon",
			"Binary", "BVH", "Collada", "DDS", "FBX", "GLTF", "HDRCubeTexture",
			"KMZ", "MD2", "MMD", "MTL", "NRRD", "OBJ", "PCD", "PDB", "PlayCanvas",
			"PLY", "PVR", "RGBE", "STL", "SVG", "TGA", "TTF", "UTF8", "VRML", "VTK"],
		kinds: ["furnishing", "shell", "wallpaper", "poster", "portal",
			"clothing", "body", "head", "hair", "eye", "teeth", "teeth_top",
			"tongue", "facial", "beard", "accessory","held"
		].concat([
			"aura", "pelvis", "lumbar", "ribs", "neck", "head", "finger",
			"hip", "knee", "ankle", "toe", "shoulder", "elbow", "wrist"
		].map(k => "worn_" + k)),
		selectors: {},
		formatted: function(ctfile) {
			var _ = vu.builders.item._, selz = _.selectors;
			if (selz.format.value == "JSON")
				return ctfile;
			var lname = selz.format.value + "Loader";
			CT.require("vu.lib.loaders." + lname, true);
			var obj_data = CT.net.get(ctfile.url),
				loader = new THREE[lname](),
				three_json = loader.parse(obj_data).toJSON();
			return CT.file.make(JSON.stringify(three_json));
		},
		asset: function(ctfile, variety) {
			var selz = vu.builders.item._.selectors;
			ctfile.upload("/_vu", selz[variety].update, {
				action: "asset",
				name: ctfile.name(),
				variety: variety,
				kind: selz.kind.value,
				owner: user.core.get("key")
			});
		},
		download: function(url, dname, lname, dclass) {
			lname = lname || "download";
			var l = CT.dom.link(lname, null,
				url, dclass, null, null, true);
			l.download = dname || lname;
			return l;
		},
		setup: function() {
			var _ = vu.builders.item._, selz = _.selectors,
				thopts = _.thopts = {}; // lol update!
			selz.name = CT.dom.smartField(function(val) {
				thopts.name = val;
				if (_.item && (_.item.name != val)) {
					vu.builders.item.persist({
						name: val
					});
					_.item.name = val;
				}
			}, "w1", null, null, null, core.config.ctvu.blurs.name);
			selz.kind = CT.dom.select(_.kinds, null, null, null, null, function(val) {
				thopts.kind = val;
				if (_.item && (_.item.kind != val)) {
					vu.builders.item.persist({
						kind: val
					});
					_.item.kind = val;
				}
			});
			selz.format = CT.dom.select(["JSON"].concat(_.loaders), null, null, "JSON");
			selz.texture_name = CT.dom.div(null, "small right italic");
			selz.stripset_name = CT.dom.div(null, "small right italic");
			selz.texture = CT.file.dragdrop(function(ctfile) {
				_.asset(ctfile, "texture");
			});
			selz.stripset = CT.file.dragdrop(function(ctfile) {
				_.asset(ctfile, "stripset");
			});
			selz.dub = CT.dom.div();
			selz.scale = CT.dom.div();
			selz.rotation = CT.dom.div();
			selz.texture.update = function(asset) {
				thopts.texture = asset && asset.item;
				if (asset && (_.item.texture != asset.key)) {
					vu.builders.item.persist({ texture: asset.key });
					vu.builders.item.update();
				}
				_.item.texture = asset && asset.key;
				CT.dom.setContent(selz.texture_name,
					asset && CT.dom.link(asset.name, function() {
						var m = CT.modal.modal([
							CT.dom.div("Texture: " + asset.name, "big centered"),
							CT.dom.img(asset.item, "w200p block"),
							CT.dom.link("browse", function() {
								m.hide();
								vu.media.texture(selz.texture.update,
									null, selz.kind.value, true);
							}, null, "right"),
							_.download(asset.item, asset.name)
						]);
					}) || CT.dom.link("browse", function() {
						vu.media.texture(selz.texture.update,
							null, selz.kind.value, true);
					}));
			};
			selz.stripset.update = function(asset) {
				thopts.stripset = asset && asset.item;
				if (asset && (_.item.stripset != asset.key)) {
					vu.builders.item.persist({ stripset: asset.key });
					vu.builders.item.update();
				}
				_.item.stripset = asset && asset.key;
				CT.dom.setContent(selz.stripset_name, asset && _.download(asset.item, asset.name, asset.name));
			};
			selz.scale.update = function() {
				CT.dom.setContent(selz.scale, CT.dom.range(function(val) {
					var fval = parseFloat(val);
					_.thing.scale(fval);
					vu.storage.setOpts(_.item.key, {
						scale: [fval, fval, fval]
					});
				}, 0.2, 16, _.thing.scale().x, 0.01, "w1"));
			};
			selz.rotation.update = function() {
				CT.dom.setContent(selz.rotation, CT.dom.range(function(val) {
					_.thing.adjust("rotation", "y", parseFloat(val));
				}, -Math.PI, Math.PI, 0, 0.01, "w1"));
			};
			selz.dub.update = function() {
				CT.dom.setContent(selz.dub, CT.dom.checkboxAndLabel("double sided",
					_.thing.material.side == 2, null, null, null, function(cbox) {
						var s = _.thing.material.side = cbox.checked ? 2 : 0;
						vu.storage.setMaterial(_.item.key, {
							side: s
						});
					}));
			};
		},
		getThings: function() {
			var _ = vu.builders.item._;
			CT.db.get("thing", function(items) {
				_.items = items;
				if (items.length)
					_.setItem(items[0]);
				else
					_.forge();
			}, 1000, null, null, {
				owners: {
					comparator: "contains",
					value: user.core.get("key")
				}
			});
		},
		setItem: function(item) {
			var _ = vu.builders.item._, selz = _.selectors, s, t, o;
			_.item = item;
			_.sharer.update(item);
			CT.dom.setContent(_.curname, item.name);
			selz.name.value = _.thopts.name = item.name;
			selz.kind.value = _.thopts.kind = item.kind;
			_.thopts.scale = item.opts.scale || [1, 1, 1];
			_.thopts.material = _.thopts.material || {};
			_.thopts.material.side = item.material.side;
			var assets = [];
			if (item.stripset)
				assets.push(item.stripset);
			if (item.texture)
				assets.push(item.texture);
			CT.db.multi(assets, function(data) {
				selz.stripset.update(CT.data.get(item.stripset));
				selz.texture.update(CT.data.get(item.texture));
				vu.builders.item.update();
			}, "json");
		},
		itemSelect: function() {
			var _ = vu.builders.item._;
			CT.modal.choice({
				prompt: "select item",
				data: [{ name: "new item" }].concat(_.items),
				cb: function(item) {
					if (item.name == "new item")
						return _.forge();
					_.setItem(item);
				}
			});
		},
		forge: function() {
			var _ = vu.builders.item._;
			CT.modal.prompt({
				prompt: "what's the new item's name?",
				cb: function(name) {
					CT.modal.choice({
						prompt: "what kind of thing is it?",
						data: _.kinds,
						cb: function(kind) {
							vu.core.v({
								action: "thing",
								owner: user.core.get("key"),
								data: {
									name: name,
									kind: kind
								}
							}, function(item) {
								_.items.push(item);
								_.setItem(item);
							});
						}
					});
				}
			});
		},
		linx: function() {
			var _ = vu.builders.item._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			_.getThings();
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.itemSelect),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		}
	},
	persist: function(updates) { // NB: this only works in remote mode, screw it ;)
		vu.storage.edit(CT.merge(updates, {
			key: vu.builders.item._.item.key
		}));
	},
	update: function() {
		var _ = vu.builders.item._, selz = _.selectors;
		if (_.thing)
			_.thing.remove();
		_.thing = new zero.core.Thing(CT.merge(_.thopts, {
			onbuild: function() {
				selz.dub.update();
				selz.scale.update();
				selz.rotation.update();
			}
		}));
		var oz = _.thing.opts;
		zero.core.current.room.update({
			texture: (oz.kind == "wallpaper") && oz.texture
		});
	},
	menu: function() {
		var _ = vu.builders.item._, selz = _.selectors;
		_.setup();
		return [
			CT.dom.div("Item Builder", "bigger centered pv10"),
			CT.dom.div([
				CT.dom.div([
					CT.dom.span("Kind"),
					CT.dom.pad(),
					selz.kind
				], "right"),
				"Name",
				selz.name
			], "padded bordered round mb5"),
			CT.dom.div([
				selz.texture_name,
				"Texture",
				selz.texture,
				CT.dom.div([
					"Paint Texture on Both Sides?",
					selz.dub
				], "padded bordered round mt5")
			], "padded bordered round mb5"),
			CT.dom.div([
//				CT.dom.div(selz.format, "right"),
				selz.stripset_name,
				"Stripset",
				selz.stripset
			], "padded bordered round mb5"),
			CT.dom.div([
				"Scale",
				selz.scale
			], "padded bordered round mb5"),
			CT.dom.div([
				"Rotation",
				selz.rotation
			], "padded bordered round")
		];
	}
};