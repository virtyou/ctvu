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
        "gesture": ["what's the gesture?", "gesture, please", "any gesture?"]
    },
    "loaders": {
        "customs": ["one.earring", "one.pony"],
        "templates": ["one.body"],
        "environments": ["one.scrolly", "one.techno", "one.kidroom"],
        "avatars": ["one.body.sassy", "one.body.kid"]
    },
    "builders": {
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