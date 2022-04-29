vu.lang = {
	_: { // derived from https://cloud.google.com/translate/docs/languages
		langs: ["Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chinese (Simplified)", "Chinese (Traditional)", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Nyanja (Chichewa)", "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala (Sinhalese)", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tagalog (Filipino)", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"],
		codes: ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ny", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"],
		voices: {
			'Russian (ru-RU)': ['Tatyana', 'Maxim'],
			'English (US) (en-US)': [
				'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Matthew'
			], 'Korean (ko-KR)': ['Seoyeon'],
			'Turkish (tr-TR)': ['Filiz'],
			'Dutch (nl-NL)': ['Lotte', 'Ruben'],
			'Portuguese (European) (pt-PT)': ['Ines', 'Cristiano'],
			'English (Australian) (en-AU)': ['Nicole', 'Russell'],
			'Italian (it-IT)': ['Carla', 'Bianca', 'Giorgio'],
			'French (Canadian) (fr-CA)': ['Chantal'],
			'Portuguese (Brazilian) (pt-BR)': ['Camila', 'Vitoria', 'Ricardo'],
			'Swedish (sv-SE)': ['Astrid'],
			'English (British) (en-GB)': ['Amy', 'Emma', 'Brian'],
			'French (fr-FR)': ['Celine', 'Lea', 'Mathieu'],
			'English (Welsh) (en-GB-WLS)': ['Geraint'],
			'German (de-DE)': ['Marlene', 'Vicki', 'Hans'],
			'English (Indian) (en-IN)': ['Aditi', 'Raveena'],
			'Arabic (arb)': ['Zeina'],
			'Spanish (US) (es-US)': ['Lupe', 'Penelope', 'Miguel'],
			'Hindi (hi-IN)': ['Aditi'],
			'Spanish (Mexican) (es-MX)': ['Mia'],
			'Icelandic (is-IS)': ['Dora', 'Karl'],
			'Polish (pl-PL)': ['Ewa', 'Maja', 'Jacek', 'Jan'],
			'Spanish (European) (es-ES)': ['Conchita', 'Lucia', 'Enrique'],
			'Japanese (ja-JP)': ['Mizuki', 'Takumi'],
			'Chinese, Mandarin (cmn-CN)': ['Zhiyu'],
			'Welsh (cy-GB)': ['Gwyneth'],
			'Danish (da-DK)': ['Naja', 'Mads'],
			'Romanian (ro-RO)': ['Carmen'],
			'Norwegian (nb-NO)': ['Liv']
		},
		init: function() {
			var _ = vu.lang._, zccp = zero.core.current.person;
			if (!_.voices.All)
				_.voices.All = Array.prototype.concat.apply([],
					Object.values(_.voices));
			if (!zccp)
				return CT.log("vu.lang._.init(): no current person!");
			if (!_.settings) {
				_.settings = CT.storage.get("language");
				_.settings || vu.lang.set();
			}
			zccp.language = _.settings;
		}
	},
	langs: function() {
		var _ = vu.lang._;
		_.init();
		return Object.keys(_.voices).sort();
	},
	voices: function(lang) {
		var _ = vu.lang._;
		_.init();
		return _.voices[lang || "All"];
	},
	set: function(lang) {
		lang = lang || "English";
		var _ = vu.lang._, lin = _.langs.indexOf(lang);
		zero.core.current.person.language = _.settings = {
			lang: lang,
			code: _.codes[lin],
			index: lin
		};
		CT.storage.set("language", _.settings);
		vu.live && vu.live.meta();
	},
	transer: function(words, slang, tlang) {
		var _ = vu.lang._;
		var butt = CT.dom.button("translate from " + slang.lang + "?", function(e) {
			CT.net.post({
				path: "/_speech",
				params: {
					action: "trans",
					words: words,
					language: slang.code,
					target: tlang.code
				},
				cb: function(trans) {
					butt.replaceWith(CT.dom.div("[translated from " + slang.lang + "]: " + trans, "bold"));
				}
			});
			e && e.stopPropagation();
		});
		return butt;
	},
	settings: function() {
		vu.lang._.init();
		return vu.lang._.settings;
	},
	menu: function() {
		var _ = vu.lang._;
		CT.modal.prompt({
			prompt: "please select your language",
			style: "single-choice",
			data: _.langs,
			defaultIndex: _.settings.index,
			cb: vu.lang.set
		});
	},
	button: function() {
		vu.lang._.init();
		return CT.dom.button("language", vu.lang.menu);
	}
};