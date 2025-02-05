CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("CT.cc");
CT.require("user.core");
CT.require("zero.core");
CT.require("zero.core.ar");
CT.require("vu.core");

CT.onload(function() {
	CT.initCore();
	vu.core.load();
	zero.core.ar.start(location.hash.slice(1));
});