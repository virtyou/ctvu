# ctvu
Connective tissue and basic interfaces for virtual world builders and applications.


# Back (Init Config)

    syms = {
    	".": ["_vu.py"],
    	"js": ["vu"],
    	"css": ["vu.css"],
    	"html": ["vu"]
    }
    model = {
    	"ctvu.model": ["*"]
    }
    routes = {
    	"/_vu": "_vu.py"
    }
    requires = ["virtyou/ctone"]

# Front (JS Config)

## core.config.ctvu
### Import line: 'CT.require("core.config");'
    {
        "access" : {
            "anon": true
        },
        "storage": {
            "mode": "local",
            "apikey": "APIKEY"
        },
        "blurs": {
            "talk": ["say something", "test voice", "type something"],
            "resource": ["what's the name?", "name this resource", "what's it called?"],
            "chain": ["enter name of chained trigger", "what happens next?", "next trigger"],
            "vibe": ["name that vibe", "what's the vibe?", "enter the name of your vibe"],
            "iframe": ["please type in the url", "what's the web address?", "enter website"],
            "lat": ["what's the latitude?", "enter latitude", "latitude please"],
            "lng": ["what's the longitude?", "enter longitude", "longitude please"],
            "environment": ["what's the environment?", "which environment?", "environment"],
            "gesture": ["what's the gesture?", "gesture, please", "any gesture?"],
            "dance": ["got a dance in mind?", "how about a dance?", "would you like to dance?"],
            "name": ["what's the name?", "name, please", "name?"]
        },
        "loaders": {
            "customs": ["one.earring", "one.pony"],
            "templates": ["one.body"],
            "environments": ["one.scrolly", "one.techno", "one.box", "one.kidroom"],
            "avatars": ["one.body.sassy", "one.body.kid"]
        },
        "builders": {
            "talk": {
                "help": {
                    "responses": "Your character will say one of these in response to this trigger.",
                    "disable": "Disable any triggers that should no longer apply at this point in the conversation. Use 'untrigger' to clear all.",
                    "chain": "Chain together triggers to define complex responses.",
                    "vibe": "Vibes are configured on the vibe page.",
                    "mood": "Fine-tune your character's emotional response to this trigger.",
                    "media": "Various immersive effects.",
                    "gesture": "Gestures are configured on the gesture page. Use 'ungesture' to stop gesturing.",
                    "dance": "Dances are configured on the gesture page. Use 'undance' to stop dancing.",
                    "triggers": "These are the trigger words for the current branch. Use '*' for your fallback response."
                }
            },
            "tweak": {
                "staticSpring": {
                    "k": 200,
                    "damp": 100
                }
            },
            "furniture": {
                "pool": {
                    "name": "pool",
                    "thing": "Pool",
                    "scale": [1.2, 1.2, 2],
                    "position": [0, -35, 0],
                    "rotation": [-1.57, 0, 0]
                }
            },
            "room": {
                "environment": "one.scrolly",
                "objects": []
            },
            "accessories": {
                "sassy": ["earring"],
                "kid": ["hat"]
            },
            "person": {
                "mood": {},
                "colors": {},
                "responses": {},
                "voice": "Joanna",
                "body": {
                    "template": "templates.one.body.sassy"
                }
            }
        }
    }