CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.file");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.stream");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");
CT.require("vu.color");
CT.require("vu.media");
CT.require("vu.party");
CT.require("vu.storage");
CT.require("vu.builders.core");
CT.require("vu.builders.arcraft");
CT.scriptImport("CT.lib.qrcode");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.media.init();
	vu.storage.init(function() {
		// menu
		vu.builders.arcraft.menus();
		// virtual world
		vu.builders.core.init();
	});
});