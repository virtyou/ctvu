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

vu.game.Consumable.consumables = {
	heart: {
		boost: {
			hp: 5
		}
	},
	bigheart: {
		boost: {
			hp: 10
		}
	},
	juice: {
		boost: {
			breath: 10
		}
	},
	spring: {
		bounce: true
	}
};