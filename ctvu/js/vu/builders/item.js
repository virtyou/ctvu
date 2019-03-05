vu.builders.item = {
	_: {
		loaders: ["3MF", "AMF", "AssimpJSON", "Assimp", "AWD", "Babylon",
			"Binary", "BVH", "Collada", "DDS", "FBX", "GLTF", "HDRCubeTexture",
			"KMZ", "MD2", "MMD", "MTL", "NRRD", "OBJ", "PCD", "PDB", "PlayCanvas",
			"PLY", "PVR", "RGBE", "STL", "SVG", "TGA", "TTF", "UTF8", "VRML", "VTK"],
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
		setup: function() {
			var _ = vu.builders.item._, selz = _.selectors;
			selz.format = CT.dom.select(["JSON"].concat(_.loaders), null, null, "JSON");
			selz.dd = CT.file.dragdrop(function(ctfile) {
				var loader = ((selz.format.value == "JSON") ? "JSON" : "Object") + "Loader",
					thing = new zero.core.Thing({
						loader: loader,
						stripset: _.formatted(ctfile).url,
						frustumCulled: false
					});
			});
		}
	},
	menu: function() {
		var _ = vu.builders.item._, selz = _.selectors;
		_.setup();
		return [
			CT.dom.div("Item Builder", "bigger centered pv10"),
			CT.dom.div(selz.format, "padded bordered round mb5"),
			CT.dom.div(selz.dd, "padded bordered round")
		];
	}
};