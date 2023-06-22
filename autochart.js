var settings = {
	midi: 'mymegaultraawesomesong.mid', // the midi to convert
	ppqn: 1000, // pulses per quarter note in the midi (mixcraft uses 1000)
	songData: 'songdata.json', // a json file from where to get base information (anything but the notes) from
	player1Chromatic: 'chrom.json', // a json that contains data about player 1's chromatic scale (first midi note, vowels and their assigned notes)
	player2Chromatic: 'chrom2.json', // a json that contains data about player 2's chromatic scale
	player1Track: 2,
	player2Track: 1
};

var fs = require('fs');
var mid = require('midi-file');
var chart = require('./'+settings.songData);
var chromatic1 = require('./'+settings.player1Chromatic);
var chromatic2 = require('./'+settings.player2Chromatic);
var file = fs.readFileSync(settings.midi);
var midi = mid.parseMidi(file);
var tempo = Math.floor(1000000 / midi.tracks[0][0].microsecondsPerBeat * 60 * 100) / 100;
console.log('Detected BPM: '+tempo);
chart.song.bpm = tempo;
chart.song.notes = [];
var baseSection = {
	sectionBeats: 4,
	sectionNotes: [],
	typeOfSection: 0,
	gfSection: false,
	altAnim: false,
	mustHitSection: false,
	changeBPM: false,
	bpm: tempo
};
var sectionDivider = settings.ppqn * 2 / (tempo/120);
var notes = process(midi.tracks[settings.player2Track], chromatic2);
var notesBf = process(midi.tracks[settings.player1Track], chromatic1);
var newSection = clone(baseSection);
var lastSection = 0;
notes.forEach(note=>{
	let section = Math.floor(note[0] / sectionDivider);
	if(lastSection != section) {
		chart.song.notes.push(newSection);
		newSection = clone(baseSection);
		for(let i = 0; i < section - lastSection - 1; i++) {
			chart.song.notes.push(newSection);
		}
		lastSection = section;
	}
	newSection.sectionNotes.push(note);
});
chart.song.notes.push(newSection);
for(let i = 0; i <= Math.floor(notesBf[notesBf.length - 1][0] / sectionDivider) - Math.floor(notes[notes.length - 1][0] / sectionDivider); i++) {
	chart.song.notes.push(baseSection);
}
notesBf.forEach(note=>{
	let section = Math.floor(note[0] / sectionDivider);
	let offset = 0;
	if(chart.song.notes[section].sectionNotes.length == 0) chart.song.notes[section].mustHitSection = true; else offset = 4;
	chart.song.notes[section].sectionNotes.push([note[0],note[1] + offset,note[2]]);
});
fs.writeFileSync("out.json", JSON.stringify(chart));

function process(track,chromatic) {
	var timeOffset = 0;
	var noteNum = 0;
	var buffer = [];
	for(let i = 0; i < track.length; i++) {
		let event = track[i];
		//console.log(event);
		timeOffset += event.deltaTime / settings.ppqn * 500 / (tempo/120);
		if(event.type == 'noteOn') {
			noteNum++;
			let vowel = chromatic.vowelNotes[(event.noteNumber - chromatic.firstNote) % chromatic.vowelNotes.length];
			let offIndex = lookForOff(event.noteNumber,i,track);
			let length = 0;
			if(offIndex != -1 && track[offIndex].deltaTime / settings.ppqn * 500 > 250) length = (track[offIndex].deltaTime / settings.ppqn * 500 - 125) / (tempo/120);
			buffer.push([timeOffset,vowel[Math.floor(Math.random() * vowel.length)],length]);
		}
	}
	return buffer;
}

function lookForOff(noteNumber,startAt,track) {
	for(let i = startAt; i < track.length; i++) {
		if(track[i].type == 'noteOff' && track[i].noteNumber == noteNumber) return i;
	}
	return -1;
}

function clone(obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		let copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		let copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		let copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}

function noteToText(note) {
	switch(note%4) {
		case 0:
			return '<';
		case 1:
			return ' v';
		case 2:
			return '  ^';
		case 3:
			return '   >';
	}
}