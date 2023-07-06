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
	juice: {
		boost: {
			breath: 5
		}
	},
	coffee: {
		boost: {
			hp: 5,
			breath: 5
		}
	},
	spring: {
		bounce: true
	}
};