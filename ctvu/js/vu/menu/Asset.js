vu.menu.Asset = CT.Class({
	CLASSNAME: "vu.menu.Asset",
	_: {
		textures: { all: [] },
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
		modal: function(target, data) {
			var _ = this._, cb = this.opts.cb;
			CT.modal.prompt({
				prompt: "please select a texture",
				style: "icon",
				recenter: true,
				className: "basicpopup mosthigh galimg",
				data: data || _.ones.concat(_.textures.all),
				cb: function(tx) {
					target.update({ texture: tx });
					cb(tx);
				}
			});
		},
		sel: function(target) {
			var _ = this._, cb = this.opts.cb;
			return function() {
				if (target.opts.kind in _.textures) {
					CT.modal.choice({
						prompt: "want to see all options or just our recommendations?",
						data: ["all", "recommendations"],
						cb: function(subset) {
							if (subset == "all")
								return _.modal(target);
							_.modal(target, _.textures[target.opts.kind]);
						}
					});
				} else
					_.modal(target);
			};
		}
	},
	swapper: function(target) {
		return CT.dom.link("swap", this._.sel(target));
	},
	load: function(assets) {
		var tz = this._.textures, ass;
		for (ass of assets) {
			tz[ass.kind] = tz[ass.kind] || [];
			tz[ass.kind].push(ass.item);
			tz.all.push(ass.item);
		}
	},
	init: function(opts) {
		this.opts = opts;
		CT.db.get("asset", this.load, null, null, null, {
			variety: "texture"
		});
	}
});