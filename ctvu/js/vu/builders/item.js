vu.builders.item = {
	_: {
		loaders: ["3MF", "AMF", "AssimpJSON", "Assimp", "AWD", "Babylon",
			"Binary", "BVH", "Collada", "DDS", "FBX", "GLTF", "HDRCubeTexture",
			"KMZ", "MD2", "MMD", "MTL", "NRRD", "OBJ", "PCD", "PDB", "PlayCanvas",
			"PLY", "PVR", "RGBE", "STL", "SVG", "TGA", "TTF", "UTF8", "VRML", "VTK"],
		kinds: ["desk", "chair", "plant", "hair"],
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
			var _ = vu.builders.item._, selz = _.selectors;
			ctfile.upload("/_vu", selz[variety].update, {
				action: "asset",
				name: ctfile.name(),
				variety: variety,
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
			selz.texture.update = function(asset) {
				thopts.texture = asset && asset.item;
				if (asset && (_.item.texture != asset.key)) {
					vu.builders.item.persist({ texture: asset.key });
					vu.builders.item.update();
				}
				_.item.texture = asset && asset.key;
				CT.dom.setContent(selz.texture_name, asset && CT.dom.link(asset.name, function() {
					(new CT.modal.Modal({
						transition: "slide",
						content: [
							CT.dom.div("Texture: " + asset.name, "big centered"),
							CT.dom.img(asset.item, "w200p block"),
							_.download(asset.item, asset.name)
						]
					})).show();
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
				owner: user.core.get("key")
			});
		},
		setItem: function(item) {
			var _ = vu.builders.item._, selz = _.selectors, s, t;
			_.item = item;
			CT.dom.setContent(_.curname, item.name);
			selz.name.value = _.thopts.name = item.name;
			selz.kind.value = _.thopts.kind = item.kind;
			var assets = [];
			if (item.stripset)
				assets.push(item.stripset);
			if (item.texture)
				assets.push(item.texture);
			CT.db.multi(assets, function(data) {
				selz.stripset.update(CT.data.get(item.stripset));
				selz.texture.update(CT.data.get(item.texture));
				vu.builders.item.update();
			});
		},
		itemSelect: function() {
			var _ = vu.builders.item._;
			vu.core.choice({
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
			vu.core.prompt({
				prompt: "what's the new item's name?",
				cb: function(name) {
					vu.core.v({
						action: "thing",
						owner: user.core.get("key"),
						data: {
							name: name
						}
					}, function(item) {
						_.items.push(item);
						_.setItem(item);
					});
				}
			});
		},
		linx: function() {
			var _ = vu.builders.item._;
			_.curname = CT.dom.span(null, "bold"),
			_.getThings();
			return CT.dom.div([[
				CT.dom.span("viewing:"),
				CT.dom.pad(),
				_.curname
			], CT.dom.link("swap", _.itemSelect)], "left");
		}
	},
	persist: function(updates) { // NB: this only works in remote mode, screw it ;)
		vu.storage.edit(CT.merge(updates, {
			key: vu.builders.item._.item.key
		}));
	},
	update: function() {
		var _ = vu.builders.item._;
		if (_.thing)
			_.thing.remove();
		_.thing = new zero.core.Thing(_.thopts);
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
				selz.texture
			], "padded bordered round mb5"),
			CT.dom.div([
//				CT.dom.div(selz.format, "right"),
				selz.stripset_name,
				"Stripset",
				selz.stripset
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.button("Try it!", vu.builders.item.update)
			], "padded bordered round")
		];
	}
};