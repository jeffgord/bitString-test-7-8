function sketch(parent) {
    return function( p ) {

        let canvas;
        let numOscs = parent.data.spectrum.length; // number of partials
        let fMultArray = []; // array of frequency multipliers starting w/ 1 (fundamental)
        let ampArray = []; // array of amplitudes starting w/ fundamental
        let currentFreq; // fundamental frequency
        let waves = []; // array of waves (each storing its own 'y' coordinates)

        p.setup = function() {
            p.noLoop(); // draw loop not in use

            // sketch settings
            canvas = p.createCanvas(800, 250);
            canvas.parent(parent.$el);
            p.strokeWeight(5);
            p.stroke(127, 212, 195);

            // program always starts muted
            p.mute();
        }

        p.dataChanged = function(val, oldVal) {
            p.background(255);

            if (parent.data.mute) {
                p.mute();
            }

            else {
                p.clearWaves();
                p.populateSpectrumArrays();
                p.createWaves();
                p.drawWaveform();
            }

        }

        // populate amp and frequency multiplier arrays
        p.populateSpectrumArrays = function() {

          currentFreq = parseFloat(parent.data.fundamental);

          for (let i = 0; i < numOscs; i++) {
            ampArray[i] = parseFloat(parent.data.spectrum[i].amp);
            fMultArray[i] = parseFloat(parent.data.spectrum[i].fMult);
          }
        }

        // builds arrays of amplitudes for each frequency
        p.createWaves = function() {

            // loops through each oscillator
            for (let i = 0; i < numOscs; i++) {

                // holds a 'y' coordinate for each 'x' in the canvas
                let wave = [canvas.width];

                // map the amplitude scaling factor to the height of the canvas
                let amplitude = p.map(ampArray[i], 0, 1, 0, canvas.height / 2);

                // loops through all 'x' values
                for (let x = 0; x < canvas.width; x++ ) {
                    wave[x] = amplitude * p.sin(x * fMultArray[i] * 2 * Math.PI / canvas.width );
                }

                waves.push(wave);
            }

        }

        // clear contents of wave array
        p.clearWaves = function() {
            waves.length = 0;
        }

        p.drawWaveform = function() {

            let allAmpsZero = true;

            for (let x = 0; x < canvas.width; x++) {
                let yComposite = 0;
                let ampTotal = 0;

                for (let i = 0; i < waves.length; i++) {
                    yComposite += waves[i][x];

                    if (ampArray[i] != 0)
                        allAmpsZero = false;

                    // running total, accounting for edge case of 0 hz
                    if (fMultArray[i] != 0)
                        ampTotal += ampArray[i];
                }

                yComposite /= ampTotal;

                if (allAmpsZero)
                    p.mute();

                p.point(x, yComposite + canvas.height / 2);
            }
        }

        // when muted, draw a straight line
        p.mute = function() {
            p.line(0, canvas.height / 2, canvas.width, canvas.height / 2);
        }

    }
}