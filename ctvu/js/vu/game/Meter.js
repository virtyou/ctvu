vu.game.Meter = CT.Class({
	CLASSNAME: "vu.game.Meter",
	_: {
		width: function() {
			return (this.value / this.opts.cap) * 100 + "%";
		}
	},
	status: function() {
		return this.value + "/" + this.opts.cap;
	},
	full: function() {
		return this.value == this.opts.cap;
	},
	set: function(val, cap) {
		this.value = Math.max(val, 0);
		if (cap)
			this.opts.cap = (cap === true) ? Math.max(val, this.opts.cap) : cap;
		this.silent || this.log("value:", this.value, "cap:", this.opts.cap);
		this.counter.style.width = this._.width();
	},
	setVisibility: function(isVis) {
		isVis ? this.show() : this.hide();
	},
	show: function() {
		this.menu ? this.menu.show("ctmain") : CT.dom.show(this.line);
	},
	hide: function() {
		this.menu ? this.menu.hide() : CT.dom.hide(this.line);
	},
	initMeter: function() {
		const oz = this.opts;
		this.counter = CT.dom.div(null, oz.counterClass);
		this.line = CT.dom.div(this.counter, "bordered noflow");
		this.counter.style.width = this._.width();
		this.line.style.width = oz.lineWidth;
		if (this.opts.menu)
			this.menu = vu.core.menu("battle", "top", this.line);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			cap: 100,
			menu: false,
			silent: true,
			lineWidth: "100%",
			counterClass: "h15p redback"
		});
		this.silent = opts.silent;
		this.value = isNaN(opts.value) ? opts.cap : opts.value;
		this.initMeter();
	}
});