// LZW encode/decode
define([], function() {
    // characters < 128 is 7-bit ascii, fine for JSON -- unicode escape
    // any characters larger than that with \uXXXX escapes.
    // can set MAX_ALPHA_CODE to other values (eg 256) for different char sets
    var MAX_ALPHA_CODE = 128;

    // maximum index allowed in the output.
    // Javascript strings are UCS-2 which forces this limitation.
    // with some effort one might fix fromCharCode/toCharCode to raise the limit
    var MAX_OUTPUT_CODE = 0x10000; // ie, emit 0xFFFF only.

    // utf8 encoding, thanks to Johan Sundström:
    // http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
    function encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    }
    function decode_utf8(s) {
        return decodeURIComponent(escape(s));
    }

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
                if (code < MAX_OUTPUT_CODE) {
                    // stop growing the dictionary
                    dict[phrase + currChar] = code;
                    code++;
                    if (code===0xD800) { code=0xE000; }//UTF-16 hack
                }
                phrase=currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

        // convert array of numbers to string
        console.assert(code <= MAX_OUTPUT_CODE);
        for (i=0; i<out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return encode_utf8(out.join(''));
    }

    // Decompress an LZW-encoded string
    function lzw_decode(s) {
        var dict = {};
        var data = decode_utf8(s + "").split("");
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
            if (code===0xD800) { code=0xE000; }//UTF-16 hack
            oldPhrase = phrase;
        }
        return out.join("");
    }

    return {
        encode: lzw_encode,
        decode: lzw_decode
    };
});
