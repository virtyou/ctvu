vu.build.struct = {
	strup: function(variety) {
		var ro = zero.core.current.room.opts, d = {};
		vu.build.core.getOpts()[variety] = d[variety] = ro[variety];
		vu.storage.setOpts(ro.key, d);
	},
	check: function(prop, fopts, variety) {
		var vb = vu.build;
		return vb.core.check(prop, fopts, () => vb.struct.strup(variety));
	},
	structs: function(variety) {
		var vb = vu.build, bs = vb.struct, selz = vb.core.getSel(),
			zcc = zero.core.current, zccr, voz, fpz, flo,
			plur = variety + "s", cont, collapser,
			sel = selz[plur] = CT.dom.div();
		sel.update = function() {
			zccr = zcc.room;
			voz = zccr.opts[variety] = zccr.opts[variety] || {
				parts: [],
				material: {
					side: THREE.DoubleSide
				}
			};
			if (variety == "obstacle")
				voz.dimensions = [10, 10, 10, 1, 1];
			fpz = voz.parts;
			cont = CT.dom.div(fpz.map(bs[variety]));
			collapser = CT.dom.link("collapse", function() {
				collapser._collapsed = !collapser._collapsed;
				collapser.innerHTML = collapser._collapsed ? "expand" : "collapse";
				CT.dom.showHide(cont);
			});
			CT.dom.setContent(sel, [
				CT.dom.div([
					collapser,
					CT.dom.button("add", function() {
						flo = {
							position: [0, 0, 0]
						};
						if (variety == "stala")
							flo.coneGeometry = 100;
						else if (variety == "boulder") {
							flo.sphereGeometry = 100;
							flo.sphereSegs = 5; // 3-8
							flo.geoThetaLength = Math.PI; // 0.1-2PI
						} else if (variety == "obstacle")
							flo.scale = [10, 10, 10];
						else {
							flo.planeGeometry = true;
							flo.scale = [80, 80, 1];
						}
						fpz.push(flo);
						bs.strup(variety);
						vu.builders.zone.update(); // overkill?
						setTimeout(sel.update, 500);
					})
				], "up20 right"),
				cont
			]);
		};
		return CT.dom.div([
			plur,
			sel
		], "topbordered padded margined");
	},
	structural: function() {
		var vb = vu.build, bs = vb.struct, sel = CT.dom.div([
			bs.structs("wall"),
			bs.structs("ramp"),
			bs.structs("floor"),
			bs.structs("obstacle"),
			bs.structs("boulder"),
			bs.structs("stala")
		]), selz = vb.core.getSel();
		selz.structural = sel;
		sel.update = function() {
			selz.walls.update();
			selz.ramps.update();
			selz.floors.update();
			selz.obstacles.update();
			selz.boulders.update();
			selz.stalas.update();
		};
	},
	struct: function(variety, fopts, i) {
		var vb = vu.build, vbc = vb.core, bs = vb.struct, s3 = [
			"wall", "obstacle", "boulder", "stala"
		].includes(variety), item = zero.core.current.room[variety + i], cont = [
			vu.media.swapper.texmo(item, function(txups) {
				Object.assign(fopts, txups);
				bs.strup(variety);
			}),
			vbc.name(item),
			vbc[s3 ? "scalers" : "scale"](item, function(scale) {
				fopts.scale = s3 ? scale : [scale, scale, scale];
				bs.strup(variety);
			}, 1, 500, 1, variety == "wall" && ["x", "y"], "topbordered padded margined"),
			vbc.level(item, function(yval) {
				fopts.position[1] = yval;
				bs.strup(variety);
			})
		], rot, ry, sta, newrx;
		if (variety == "wall") {
			cont.push(CT.dom.button("rotate", function() {
				rot = item.rotation();
				ry = rot.y ? 0 : Math.PI / 2;
				item.adjust("rotation", "y", ry);
				fopts.rotation = [rot.x, ry, rot.z];
				bs.strup(variety);
			}, "w1"));
			cont.push(CT.dom.br());
			cont.push(vbc.side(item, function(sopts) {
				fopts.material = sopts;
				bs.strup(variety);
			}));
			cont.push(bs.check("flammable", fopts, "wall"));
		} else if (variety == "stala") {
			rot = item.rotation();
			sta = rot.x ? "stalactite" : "stalagmite";
			cont.push(CT.dom.select({
				names: ["stalagmite", "stalactite"],
				curvalue: sta,
				onchange: function(val) {
					newrx = val == "stalactite" ? Math.PI : 0;
					fopts.rotation = [newrx, rot.y, rot.z];
					item.adjust("rotation", "x", newrx);
					bs.strup(variety);
				}
			}));
		} else if (variety == "boulder") {
			cont.push(vu.core.ranger("faces", function(fnum) {
				fopts.sphereSegs = parseInt(fnum);
				bs.strup(variety);
			}, 3, 8, fopts.sphereSegs, 1));
			cont.push(vu.core.ranger("theta", function(fnum) {
				fopts.geoThetaLength = parseFloat(fnum);
				bs.strup(variety);
			}, 0.1, Math.PI * 2, fopts.geoThetaLength, 0.1));
		} else {
			if (variety == "ramp") {
				cont.push(vbc.tilt(item, function(rot) {
					fopts.rotation = [rot, 0, 0];
					bs.strup(variety);
				}));
			} else if (variety == "floor") {
				cont.push(vbc.side(item, function(sopts) {
					fopts.material = sopts;
					bs.strup(variety);
				}));
				cont.push(vbc.scroll(item, function(sopts) {
					fopts.scroll = sopts;
					bs.strup(variety);
				}));
				cont.push(vbc.shift(item, function(sopts) {
					fopts.shift = sopts;
					bs.strup(variety);
				}));
				cont.push(vbc.mosh(fopts, function(moshiness) {
					fopts.moshy = moshiness;
					bs.strup(variety);
				}));
			}
			cont.push(vbc.grip(item, function(isgrippy) {
				fopts.grippy = isgrippy;
				bs.strup(variety);
			}));
		}
		["boulder", "stala"].includes(variety) && ["brittle",
			"frozen"].forEach(prop => cont.push(bs.check(prop, fopts, variety)));
		return cont;
	},
	wall: function(fopts, i) {
		return vu.build.struct.struct("wall", fopts, i);
	},
	ramp: function(fopts, i) {
		return vu.build.struct.struct("ramp", fopts, i);
	},
	floor: function(fopts, i) {
		return vu.build.struct.struct("floor", fopts, i);
	},
	obstacle: function(fopts, i) {
		return vu.build.struct.struct("obstacle", fopts, i);
	},
	boulder: function(fopts, i) {
		return vu.build.struct.struct("boulder", fopts, i);
	},
	stala: function(fopts, i) {
		return vu.build.struct.struct("stala", fopts, i);
	}
};