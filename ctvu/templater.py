def torso(opts, headgear=None):
    head = {
        "name": "head",
        "thing": "Head",
        "parts": [{
            "name": "teeth",
            "texture": opts["teeth_texture"],
            "stripset": opts["teeth_stripset"],
            "position": [0, -9.5, 2.5],
            "material": {
                "color": opts["teeth_color"],
                "morphTargets": True
            },
            "mti": {
                "3": 1
            }
        }, {
            "name": "teeth_top",
            "texture": opts["teeth_top_texture"],
            "stripset": opts["teeth_top_stripset"],
            "position": [0, -9.4, 2.5],
            "rotation": [0.01, 0, 0],
            "material": {
                "color": opts["teeth_top_color"],
                "morphTargets": True
            },
            "mti": {
                "1": 1
            }
        }, {
            "name": "tongue",
            "texture": opts["tongue_texture"],
            "stripset": opts["tongue_stripset"],
            "position": [0, -9.2, 2.5],
            "rotation": [0.01, 0, 0],
            "material": {
                "color": opts["tongue_color"],
                "morphTargets": True
            },
            "mti": {
                "2": 1
            }
        }, {
            "name": "eyeGroupL",
            "parts": [{
                "name": "eyeL",
                "kind": "eye",
                "texture": opts["eye_texture"],
                "stripset": opts["eye_stripset"],
                "scale": [0.9, 0.9, 0.9],
                "material": {
                    "color": opts["eyeL_color"],
                    "specular": 0xaaaaff,
                    "morphTargets": True,
                    "emissive": 0,
                    "alphaTest": 0.5,
                    "reflectivity": 1000000,
                    "metal": False,
                    "shininess": 1000
                }
            }, {
                "name": "cubeLeyeDummy",
                "cubeGeometry": [1, 1, 10],
                "material": {
                    "color": 0x00ff00,
                    "visible": False
                }
            }]
        }, {
            "name": "eyeGroupR",
            "parts": [{
                "name": "eyeR",
                "kind": "eye",
                "texture": opts["eye_texture"],
                "stripset": opts["eye_stripset"],
                "scale": [0.9, 0.9, 0.9],
                "material": {
                    "color": opts["eyeR_color"],
                    "specular": 0xaaaaff,
                    "morphTargets": True,
                    "emissive": 0,
                    "alphaTest": 0.5,
                    "reflectivity": 1000000,
                    "metal": False,
                    "shininess": 1000
                }
            }, {
                "name": "cubeReyeDummy",
                "cubeGeometry": [1, 1, 10],
                "material": {
                    "color": 0x00ff00,
                    "visible": False
                }
            }]
        }]
    }
    if headgear:
        for gear in headgear:
            head["parts"].append(gear)
    else:
        head["parts"].append(hair(opts))
    return {
        "name": "body",
        "morphStack": opts["morphStack"],
        "texture": opts["texture"],
        "stripset": opts["stripset"],
        "matcat": "Phong",
        "meshcat": "SkinnedMesh",
        "material": {
            "color": opts["color"],
            "morphTargets": False,
            "skinning": True,
            "emissive": 0,
            "alphaTest": 0.5,
            "reflectivity": 10,
            "shininess": 2
        },
        "parts": [{
            "name": "looker",
            "position": [0, 35, 25],
            "cubeGeometry": [1, 1, 5],
            "material": {
                "color": 0x00ff00,
                "visible": False
            }
        }, {
            "name": "lookAt",
            "position": [0, 35, 55],
            "cubeGeometry": [1, 1, 5],
            "material": {
                "color": 0x00ff00,
                "visible": False
            }
        }, {
            "name": "torso",
            "thing": "Torso",
            "meshcat": "SkinnedMesh",
            "texture": opts["dress_texture"],
            "stripset": opts["dress_stripset"],
            "repeat": opts["dress_repeat"],
            "material": {
                "color": opts["dress_color"],
                "specular": 0xff3333,
                "morphTargets": False,
                "skinning": True,
                "emissive": 0,
                "transparency": True,
                "alphaTest": 0.3,
                "reflectivity": 0.9,
                "shininess": 8,
                "metal": False
            },
            "parts": [{
                "name": "neck",
                "parts": [head]
            }]
        }]
    }

def hair(opts):
    return {
        "name": opts.get("hair_name", "hair"),
        "kind": "hair",
        "texture": opts["hair_texture"],
        "stripset": opts["hair_stripset"],
        "position": opts.get("hair_position", [0, -9, 2.4]),
        "repeat": [8, 1],
        "material": {
            "color": opts.get("hair_color", 0x447788),
            "specular": opts.get("hair_specular", 0xaaaaff),
            "morphTargets": False,
            "emissive": 0,
            "transparency": True,
            "alphaTest": 0.3,
            "reflectivity": 0.9,
            "shininess": 8,
            "metal": False
        }
    }