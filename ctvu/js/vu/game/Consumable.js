vu.game.Consumable = CT.Class({
	CLASSNAME: "vu.game.Consumable",
	consumers: {
		boost: function() {
			var prop, ob = this.opts.boost;
			for (prop in ob)
				this.player.score(prop, ob[prop]);
		},
		bounce: function() {
			this.player.person.doLeap(true);
		}
	},
	consume: function() {
		for (var c in this.consumables)
			this.opts[c] && this.consumers[c]();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, vu.game.Consumable.consumables[opts.kind], {
			boost: null, // { hp: 2, breath: 5 }
			bounce: null
		}, this.opts);
		this.player = zero.core.current.player;
	}
}, zero.core.Thing);

var P = Math.PI, P8 = P / 8;
vu.game.Consumable.consumables = {
	heart: {
		boost: {
			hp: 5
		},
		sharedmat: true,
		material: {
			color: "#ff0000"
		},
		parts: [{
			coneGeometry: 10,
			position: [-4, 0, 0],
			rotation: [0, 0, P + P8],
			parts: [{
				sphereGeometry: 10,
				position: [0, -10, 0]
			}]
		}, {
			coneGeometry: 10,
			position: [4, 0, 0],
			rotation: [0, 0, P - P8],
			parts: [{
				sphereGeometry: 10,
				position: [0, -10, 0]
			}]
		}]
	},
	"ice cream": {
		boost: {
			breath: 5
		},
		coneGeometry: 10,
		rotation: [0, 0, P],
		material: {
			color: "#cda26f"
		},
		parts: [{
			sphereGeometry: 9,
			position: [0, -10, 0],
			material: {
				color: "#e77da3"
			}
		}]
	},
	burger: {
		boost: {
			hp: 5,
			breath: 5
		},
		sphereGeometry: 10,
		scale: [1.1, 0.7, 1.1],
		material: {
			color: "#fcb54d"
		},
		parts: [{
			sphereGeometry: 10,
			scale: [1.1, 0.7, 1.1],
			material: {
				color: "#450101"
			}
		}]
	},
	spring: {
		bounce: true
	}
};