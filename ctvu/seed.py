"""
seeder script -- create initial stuff
 - CTUserz, Partz (bodies - templated), Personz, Roomz, Thingz
 - convert assets to Assetz (blobbed): texture, stripset
"""

from cantools.util import log, error, read
from model import db, CTUser, Person, Part, Asset, Room, Thing
import templater

defaults = {
    "morphStack": "one.head",
    "color": 0xccbbdd,
    "dress_repeat": None,
    "dress_color": 0xcccccc,
    "hair_color": 0x447788,
    "hair_specular": 0xaaaaff,
    "teeth_color": 0xcccccc,
    "teeth_top_color": 0xcccccc,
    "tongue_color": 0xcccccc,
    "eyeL_color": 0xffffff,
    "eyeR_color": 0xffffff,
    "tongue_texture": None
}
assets = {
    "sassy": {
        "texture": "maps/one/head.jpg",
        "stripset": "models/one/fathead.js",
        "dress_texture": "maps/one/icon.jpg",
        "dress_stripset": "models/one/torso.js",
        "hair_texture": "maps/one/hairShrunk.png",
        "hair_stripset": "models/one/hairDFULL5.js",
        "eye_texture": "maps/one/eye_brown_basic.jpg",
        "eye_stripset": "models/one/eyeCminusHole3.js",
        "teeth_texture": "maps/one/teeth256s.jpg",
        "teeth_stripset": "models/one/teeth_yan.js",
        "teeth_top_texture": "maps/one/white.jpg",
        "teeth_top_stripset": "models/one/teeth_top_yan.js",
        "tongue_stripset": "models/one/tongue_yan.js"
    }
}
responses = {
    "test": {
        "mood": {
            "mad": 0.5
        },
        "phrase": [
            "don't test my patience!",
            "is this a test? are you testing me?",
            "testing, testing, one, two, three. i don't like tests."
        ],
        "branches": {
            "test":  {
                "phrase": "i told you not to test my patience",
                "mood": {
                    "mad": 1.0,
                    "antsy": 0.5
                }
            }
        }
    },
    "unlock": {
        "phrase": "you've unlocked branch 1",
        "mood": {
            "happy": 0.3
        },
        "branches": {
            "unlock": {
                "phrase": "you've unlocked branch 2 -- want the prize?",
                "mood": {
                    "happy": 0.6
                },
                "branches": {
                    "prize": {
                        "phrase": "congratulations, you got the prize!",
                        "mood": {
                            "happy": 1.0
                        },
                        "branches": {
                            "prize": "you already got the prize",
                            "reset": {
                                "phrase": "ok, i reset unlock and prize",
                                "disable": ["unlock", "prize"]
                            }
                        }
                    }
                }
            }
        }
    },
    "bad": {
        "mood": {
            "sad": 0.9,
            "happy": 0
        },
        "phrase": [
            "that's a bummer",
            "how awful",
            "i'm sad"
        ]
    },
    "relax": {
        "mood": {
            "sad": 0,
            "mad": 0,
            "antsy": 0,
            "happy": 0
        },
        "phrase": [
            "better now",
            "i'm fine",
            "back to neutral"
        ],
        "branches": {
            "calm": {
                "phrase": "i told you, i am calm",
                "mood": {
                    "mad": 0.5,
                    "antsy": 0.5
                },
                "branches": {
                    "calm": {
                        "phrase": [
                            "i said i'm calm, jerk!",
                            "you calm down!",
                            "shut up nerd"
                        ],
                        "mood": {
                            "mad": 1.0
                        }
                    }
                }
            }
        }
    }
}
voices = {
    "sassy": "Joanna"
}
furnishings = {
    "pool": {
        "thing": "Pool",
        "scale": [1.2, 1.2, 2],
        "position": [0, -35, 0],
        "rotation": [-6.28/4, 0, 0]
    }
}
headgear = {
    "sassy": [{
        "name": "earring",
        "kind": "headgear",
        "custom": "js/custom/one/earring.js"
    }, {
        "name": "pony",
        "kind": "hair",
        "custom": "js/custom/one/pony.js"
    }]
}
hairz = {
    "blip": {
        "texture": "maps/one/hair_alphaGimp3_2SMALL.png",
        "stripset": "models/one/hair2ALPHA_XX5.js"
    },
    "blop": {
        "texture": "maps/one/hair.png",
        "stripset": "models/one/hair4mario.js",
        "position": [0, 0, 0]
    },
    "clip": {
        "texture": "maps/one/hair.png",
        "stripset": "models/one/hair4marioA.js",
        "position": [0, 0, 0]
    },
    "clop": {
        "texture": "maps/one/hair.png",
        "stripset": "models/one/hair4marioB.js",
        "position": [0, 0, 0]
    }
}
LIGHTS = [
    {
        "variety": "ambient"
    }, {
        "variety": "directional",
        "color": 0xcccccc,
        "intensity": 0.8,
        "position": [0.5, 0.5, 0.1]
    }, {
        "variety": "directional",
        "color": 0xeeeeee,
        "position": [-1, 1, -0.3]
    }
]
VARZ = {} # meh

def user(name, email):
    log("user: %s, %s"%(name, email), 1)
    u = CTUser()
    u.active = u.admin = True
    u.email = email
    u.firstName = name
    u.lastName = "zero"
    u.put()
    u.password = db.hashpass("password", u.created)
    u.put()
    return u

loaded_assets = {}

def asset(name, path=None, variety=None):
    path = path or assets[VARZ["name"]][name]
    log("asset: %s (%s)"%(name, path), 2)
    # this caching stuff only works if "name" is the same
    # otherwise, it won't reattach right
    a = loaded_assets.get(path)
    if not a:
        log("asset not found! creating...", 3)
        a = loaded_assets[path] = Asset()
        a.owner = VARZ["owner"]
        a.name = name
        a.item = read(path)
        a.variety = variety or name.split("_")[-1]
        a.put()
    elif name != a.name:
        error("same blob, different name (%s is not %s) -- nope!"%(name, a.name))
    return a.key

def gear(name):
    gz = headgear[name]
    for g in gz:
        if g["custom"]:
            g["custom"] = read(g["custom"])
        for prop in ["texture", "stripset"]:
            if prop in g:
                setattr(g, prop, asset(prop, g[prop]))
    return gz

def body(name): # from template
    template = "templates.one.body.%s"%(name,)
    log("body (templated): %s"%(template,), 1)
    bod = Part()
    bod.template = template
    bod.assets = map(asset, assets[name].keys())
    bod.put()
    return bod

def thing(obj):
    log("thing: %s"%(obj["name"],), 2)
    t = Thing()
    t.owner = VARZ["owner"]
    for prop in ["texture", "stripset", "morphStack", "name", "custom", "kind"]:
        if prop in obj:
            setattr(t, prop, obj.pop(prop))
    t.material = obj.pop("material", {})
    t.opts = obj
    t.put()
    return t

def part(obj, parent=None):
    log("part: %s"%(obj["name"],), 2)
    subz = obj.pop("parts", [])
    par = Part()
    par.base = thing(obj).key
    par.parent = parent
    par.put()
    for sub in subz:
        part(sub, par.key)
    return par

def parts(name):
    log("body (parts): %s"%(name,), 1)
    opts = defaults.copy()
    for key in assets[name]:
        opts[key] = asset(key)
    return part(templater.torso(opts, gear(name)))

def person(name, body_generator=body):
    log("person: %s"%(name,))
    p = Person()
    p.owner = VARZ["owner"] = user(name, "%s@virtyou.org"%(name,)).key
    p.name = VARZ["name"] = name
    p.voice = voices[name]
    p.responses = responses
    p.body = body_generator(name).key
    p.put()
    return p

def room(name):
    log("room: %s"%(name,), 1)
    r = Room()
    r.opts = { "environment": name, "lights": LIGHTS }
    r.owner = VARZ["owner"]
    r.put()
    return r

def furnishing(name):
    log("furnishing: %s"%(name,), 1)
    f = Thing()
    f.owner = VARZ["owner"]
    f.kind = "furnishing"
    f.name = name
    f.opts = furnishings[name]
    f.put()
    return f

def extras():
    log("extras")
    for name, obj in hairz.items():
        t = obj["texture"]
        s = obj["stripset"]
        opts = {
            "hair_name": name,
            "hair_texture": asset(t.split("/")[1].split(".")[0], t, "texture"),
            "hair_stripset": asset(s.split("/")[1].split(".")[0], s, "stripset")
        }
        if "position" in obj:
            opts["hair_position"] = obj["position"]
        thing(templater.hair(opts))

def seed():
    log("seeding database", important=True)
    sassy = person('sassy', parts)
    techno = room('one.techno')
    pool = furnishing('pool')
    extras()
    log("goodbye", important=True)

def setResponses(resps):
    global responses
    responses = resps