// LZW encode/decode
define([], function() {
    // characters < 128 is 7-bit ascii, fine for JSON -- unicode escape
    // any characters larger than that with \uXXXX escapes.
    // can set MAX_ALPHA_CODE to other values (eg 256) for different char sets
    var MAX_ALPHA_CODE = 256;//128;

    // maximum index allowed in the output.
    // Javascript strings are UCS-2 which forces this limitation.
    // with some effort one might fix fromCharCode/toCharCode to raise the limit
    var MAX_OUTPUT_CODE = 0x10000; // ie, emit 0xFFFF only.

    // Compress a string using LZW encoding
    function lzw_encode(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        console.assert(phrase.charCodeAt(0) < MAX_ALPHA_CODE);
        var code = MAX_ALPHA_CODE, i;
        for (i=1; i<data.length; i++) {
            currChar=data[i];
            console.assert(currChar.charCodeAt(0) < MAX_ALPHA_CODE);
            if (dict.hasOwnProperty(phrase + currChar)) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase=currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

        // convert array of numbers to string
        console.assert(code <= MAX_OUTPUT_CODE);
        for (i=0; i<out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join('');
    }

    // Decompress an LZW-encoded string
    function lzw_decode(s) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = data[0];
        var oldPhrase = currChar;
        var out = [currChar];
        var code = MAX_ALPHA_CODE;
        var phrase, i;
        for (i=1; i<data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode < MAX_ALPHA_CODE) {
                phrase = data[i];
            }
            else {
                // note the special 'one greater than dict length' case.
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    }

    return {
        encode: lzw_encode,
        decode: lzw_decode
    };
});
