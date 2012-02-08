var $Guitar = (function () {

    var self = {};
    var stringOffsets = [4, 9, 14, 19, 23, 28];
    var notes = [
        'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'
    ];
    var notesLookup = {};
    var settings = {};
    var chord, chordNotes;

    for (var i = 0; i < notes.length; ++i) {
        notesLookup[notes[i]] = i;
    }

    self.calcNote = function (fret, string) {
        var index = (fret + stringOffsets[string]) % notes.length;
        return notes[index];
    };

    self.calcNoteColor = function (fret, string) {
        var note = fret + stringOffsets[string];
        var index = note % 12;
        var hue = index * (settings.colorScale / 36);
        var saturation = 50 + (note * (50 / settings.frets));
        var lightness = 10 + (note * (20 / settings.frets));

        return 'hsla(' + hue + ', ' + saturation + '%, ' + lightness + '%, 1)';
    };

    self.isBlackKey = function (letter) {
        return letter.indexOf('/') >= 0;
    };

    self.isWhiteKey = function (letter) {
        return ! self.isBlackKey(letter);
    };

    self.drawNeck = function () {
        var fretElem, stringElem, noteElem, letterElem, letter;

        $(self.root).empty();

        for (var fret = 0; fret <= settings.frets; ++fret) {
            fretElem = $('<div/>')
                .addClass('fret')
                .appendTo(self.root);

            for (var string = 5; string >= 0; --string) {

                letter = self.calcNote(fret, string);

                noteElem = $('<div/>')
                    .addClass('note');

                if ((self.isBlackKey(letter) && settings.enableBlackKeys) || (self.isWhiteKey(letter) && settings.enableWhiteKeys)) {
                    letterElem = $('<div/>')
                        .addClass('letter')
                        .text(self.calcNote(fret, string))
                        .appendTo(noteElem);
                }

                if (settings.enableColor) {
                    $(noteElem).css({
                        'background-color': self.calcNoteColor(fret, string)
                    });
                }

                stringElem = $('<div/>')
                    .addClass('string')
                    .appendTo(fretElem)
                    .append(noteElem);
            }

            $('<div/>')
                .addClass('label')
                .text(fret)
                .appendTo(fretElem);

            // Extend neck to scroll horizontally
//            $(self.root).width(100 + settings.frets * $('.fret').width());

            self.drawChord();
        }
    };

    self.drawChord = function () {
        var fret;

        if (chord) {
            for (var string = 0; string < 6; ++string) {
                fret = chord[string];
                if (fret == -1) {
                    // Don't play string
                    $('.fret').eq(0).find('.string').eq(5 - string).addClass('no-finger');
                }
                else {
                    $('.fret').eq(fret).find('.string').eq(5 - string).addClass('finger');
                }
            }
        }

        $('#chordNotes').empty();
        if (chordNotes) {
            $('#chordNotes').text(chordNotes.join(', '));
        }
    };

    self.calcChord = function () {
        var root = $('input[name="chord-root"]:checked').val();
        var chordData = self.calcChordOpen(root);
        chord = chordData[0];
        chordNotes = chordData[1];
    };

    self.findThird = function (root) {

    };

    self.calcChordOpen = function (root) {
        var string, fret, note, noteIndex;
        var first, third, fifth;
        var foundNote, foundFirst, foundThird, foundFifth;
        var chord = [-1, -1, -1, -1, -1, -1];
        var chordNotes;

        first = root;
        third = notes[(notesLookup[root] + 4) % notes.length];
        fifth = notes[(notesLookup[root] + 7) % notes.length];

        chordNotes = [first, third, fifth];

        // Find bass note
        for (string = 0; string < 6; ++string) {
            foundNote = false;
            for (fret = 0; fret <= 3; ++fret) {
                noteIndex = (stringOffsets[string] + fret) % notes.length;
                note = notes[noteIndex];

                if (note === first) {
                    chord[string] = fret;
                    foundNote = true;
                    foundFirst = true;
                }
                else if (foundFirst && note === third) {
                    chord[string] = fret;
                    foundNote = true;
                    foundThird = true;
                }
                else if (foundFirst && note === fifth) {
                    chord[string] = fret;
                    foundNote = true;
                    foundFifth = true;
                }
            }

            if (! foundNote) {
                // No note to play on this string, mark as don't play
                chord[string] = -1;
            }
        }

        return [chord, chordNotes];
    };

    self.init = function (root) {
        self.root = root;

        $('.setting').change(function () {

            if (this.type === 'checkbox') {
                settings[this.id] = this.checked;
            }
            else {
                settings[this.id] = this.value;
            }

            $('#' + this.id + 'Value').text(this.value);
            self.drawNeck();
        })
            // Trigger change handler to init settings
            .change();

        $('input[name="chord-root"]').click(function () {
            self.calcChord();
            self.drawNeck();
        });

        $('#clearChord').click(function () {
            chord = undefined;
            chordNotes = undefined;
            self.drawNeck();
        });

        self.drawNeck();
    };

    return self;
}());