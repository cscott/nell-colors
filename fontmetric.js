// reworked version of colors brush code -- try to generate a brush image
// from first principles.  (Then we'll use the GPU to scale up/down the
// canonical brush image.)
define(['domReady!', './lib/BlobBuilder', './lib/FileSaver', 'font!custom,families:[Delius,DejaVu LGC Sans Book],urls:[fonts/style.css]'], function(document, BlobBuilder, saveAs, isFontLoaded) {
    console.assert(isFontLoaded);
    // (note that Patrick+Hand is a reasonable alternative to Delius,
    //  if we ever need one.)

    // measure a fixed size of font, which we'll scale when we blit to
    // fit the users bounding box
    var FONT_SIZE="100px";
    var BBOX_SIZE=175;
    var TEXT_BASELINE='alphabetic';
    // outline widths
    var OUTER_OUTLINE = 6;
    var INNER_OUTLINE = 3;
    // empirically determined average stroke width for Delius
    var HALF_STROKE_WIDTH=3 + (OUTER_OUTLINE/2);

    var make_letter = function(letter) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = BBOX_SIZE;
        canvas.style.width = canvas.style.height = BBOX_SIZE+'px';
        canvas.style.background='#ccc';
        var ctxt = canvas.getContext('2d');
        ctxt.font = FONT_SIZE+' Delius';
        ctxt.textAlign="center";
        ctxt.textBaseline=TEXT_BASELINE;
        ctxt.save();
        ctxt.translate(canvas.width/2, canvas.height/2);
        ctxt.strokeStyle='white';
        ctxt.lineWidth=OUTER_OUTLINE;
        ctxt.strokeText(letter.charAt(0), 0, 0);
        ctxt.strokeStyle='black';
        ctxt.lineWidth=INNER_OUTLINE;
        ctxt.strokeText(letter.charAt(0), 0, 0);
        ctxt.fillStyle = 'red';
        ctxt.fillText(letter.charAt(0), 0, 0);
        ctxt.restore();
        // now look at canvas pixel by pixel to figure out
        // true bounding box
        var data = ctxt.getImageData(0, 0, canvas.width, canvas.height);
        var x,y,alpha;
        var Coord = function() {
            this.update = function(v) {
                if (this.min===undefined || v < this.min) { this.min = v; }
                if (this.max===undefined || v > this.max) { this.max = v; }
            };
            this.offset = function(x) {
                this.min += x; this.max -= x;
            };
        };
        var bbx = new Coord(), bby = new Coord();
        for (x=0; x < data.width; x++) {
            for (y=0; y < data.height; y++) {
                alpha = data.data[((y*data.width) + x)*4 + 3];
                if (alpha > 0) {
                    bbx.update(x); bby.update(y);
                }
            }
        }
        // overlay the computed boxing box
        ctxt.fillStyle='rgba(255,255,0,0.5)';
        ctxt.fillRect(bbx.min, bby.min, 1+bbx.max-bbx.min, 1+bby.max-bby.min);
        // adjust for stroke width
        bbx.offset(HALF_STROKE_WIDTH); bby.offset(HALF_STROKE_WIDTH);
        ctxt.fillStyle='rgba(0,0,0,0.25)';
        ctxt.fillRect(bbx.min, bby.min, 1+bbx.max-bbx.min, 1+bby.max-bby.min);
        // ok, package all this info up.
        var result = {
            cx: (bbx.min + 1+bbx.max)/2 - canvas.width/2,
            cy: (bby.min + 1+bby.max)/2 - canvas.height/2,
            w:  1+bbx.max-bbx.min,
            h:  1+bby.max-bby.min
        };
        result.fw = result.w + 2*HALF_STROKE_WIDTH;
        result.fh = result.h + 2*HALF_STROKE_WIDTH;
        return [canvas, result];
    };

    var ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZ"+
                 "abcdefghijklmnopqrstuvwxyz"+
                 "0123456789";
    var i;
    var json = {
        font: FONT_SIZE+' Delius',
        textAlign: 'center',
        textBaseline: TEXT_BASELINE,
        outerOutline: OUTER_OUTLINE,
        innerOutline: INNER_OUTLINE
    };
    for (i=0; i<ALPHABET.length; i++) {
        var letter = ALPHABET.charAt(i);
        var result = make_letter(letter);
        var c = result[0];
        json[letter] = result[1];
        // make result visible
        c.style.border = '1px solid #666';
        document.body.appendChild(c);
    }
    // ok, now put the actual result in a downloadable form
    json = JSON.stringify(json);
    var blob, blobUrl;
    var mimetype = "text/plain;charset=ascii";
    try {
        blob = new window.Blob([json], {type: mimetype});
    } catch (e) {
        var bb = new BlobBuilder();
        bb.append(json);
        blob = bb.getBlob(mimetype);
    }
    var div = document.createElement('div');
    var button = document.createElement('button');
    button.innerText="Download!";
    button.addEventListener('click', function() {
        saveAs(blob, 'fontmetrics.json');
    }, false);
    div.appendChild(button);
    document.body.appendChild(div);
});
