"user strict";

var include_arr = ["API/CodeOrgAPI.js", "Event/EventType.js", "LevelMVC/FacingDirection.js"];
include_arr = include_arr.map(function (file) {
	return `./src/js/game/${file}`;
});

module.exports = {
	"opts": {
		"destination": "./docs/out"
	},
	"plugins": [],
	"recurseDepth": 10,
	"source": {
		"include": include_arr,
		"includePattern": ".+\\.js?$",
		"excludePattern": "(^|\\/|\\\\)_"
	},
	"sourceType": "module",
	"tags": {
		"allowUnknownTags": true,
		"dictionaries": ["jsdoc", "closure"]
	},
	"templates": {
		"cleverLinks": false,
		"monospaceLinks": false,
		"default": {
			"includeDate": false
		},
		"systemName": "Craft",
		"copyright": "Copyright 2021-<script>document.write(new Date().getFullYear());</script> craft-devs.",
		"search": false,
		"includeDate": false
	}
};
