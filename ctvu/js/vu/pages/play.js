CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.pubsub");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("CT.cc");
CT.require("user.core");
CT.require("zero.core");
CT.require("zero.core.xr");
CT.require("vu.core");
CT.require("vu.media");
CT.require("vu.audio");
CT.require("vu.color");
CT.require("vu.controls");
CT.require("vu.storage");
CT.require("vu.squad");
CT.require("vu.lang");
CT.require("vu.live");
CT.require("vu.voice");
CT.require("vu.party");
CT.require("vu.portal");
CT.require("vu.menu.Map");
CT.require("vu.builders.core");
CT.require("vu.builders.play");
CT.scriptImport("CT.lib.colorPicker");

CT.onload(function() {
	var camcfg = core.config.ctzero.camera,
		h = location.hash.slice(1);
	h && CT.storage.set("room", h);
	if (CT.info.mobile && document.body.clientWidth > document.body.clientHeight) {
		camcfg.vr = true;
		camcfg.cardboard = true;
		document.body.classList.add("unheadered");
	}
	CT.initCore();
	vu.core.init();
	vu.storage.init(function() {
		// menu
		vu.builders.play.menus();
		// virtual world
		zero.core.xr.init({
			ondecide: function(doit) {
				if (doit) {
					camcfg.vr = true;
//					camcfg.fov = 135;
				}
				vu.builders.core.init();
			}
		});
	}, true);
});