vu.menu.Asset = CT.Class({
	CLASSNAME: "vu.menu.Asset",
	_: {
		textures: {},
		ones: [
			"bg7.jpg", "bgBITZs4a.jpg", "bg_yan3.jpg", "bod.jpg",
			"bunny_ears.jpg", "bunny_teeth.jpg", "eye_brown_basic.jpg",
			"graph_paper.jpg", "hair_alphaGimp3_2SMALL.png",
			"hair_alphaGimp3a.png", "hairC5dHat.png", "hair.png",
			"hairShrunk.png", "head.jpg", "head_UV2.jpg", "icon.jpg",
			"room1.jpg", "shirt.jpg", "teeth256s.jpg", "white.jpg"
		].map(function(o) {
			return "/maps/one/" + o;
		}),
		sel: function(target) {
			var _ = this._, cb = this.opts.cb;
			return function() {
				CT.modal.prompt({
					prompt: "please select a texture",
					style: "icon",
					recenter: true,
					className: "basicpopup mosthigh galimg",
					data: _.ones,
					cb: function(tx) {
						target.update({ texture: tx });
						cb(tx);
					}
				});
			};
		}
	},
	swapper: function(target) {
		return CT.dom.link("swap", this._.sel(target));
	},
	load: function(assets) {
		var _ = this._, ass;
		_.textures.all = assets;
		for (ass of assets) {
			_.textures[ass.kind] = _.textures[ass.kind] || [];
			_.textures[ass.kind].push(ass);
		}
	},
	init: function(opts) {
		this.opts = opts;
		CT.db.get("asset", this.load, null, null, null, {
			variety: "texture"
		});
	}
});