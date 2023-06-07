vu.game.Meter = CT.Class({
	CLASSNAME: "vu.game.Meter",
	_: {
		width: function() {
			return (this.value * this.opts.unit) + "px";
		}
	},
	set: function(val) {
		this.value = Math.max(val, 0);
		this.bloodLine.style.width = this._.width();
	},
	show: function() {
		this.menu.show("ctmain");
	},
	initMeter: function() {
		this.bloodLine = CT.dom.div(null, "h15p redback");
		this.lifeLine = CT.dom.div(this.bloodLine, "bordered noflow");
		this.bloodLine.style.width = this.lifeLine.style.width = this._.width();
		if (this.opts.menu)
			this.menu = vu.core.menu("battle", "top", this.lifeLine);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			cap: 100,
			unit: 4,
			menu: false
		});
		this.value = opts.value || opts.cap;
		this.initMeter();
	}
});