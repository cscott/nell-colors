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

    // should we clear the dictionary when it is full (and start over?)
    var CLEAR_FULL_DICT = true;

    // utf8 encoding, thanks to Johan Sundström:
    // http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
    function encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    }
    function decode_utf8(s) {
        return decodeURIComponent(escape(s));
    }

    // Compress a string using LZW encoding
    function lzw_encode(s, optToUTF8) {
        var dict = {};
        var data = (s + "");
        var out = [];
        var currChar;
        var phrase = data.charAt(0);
        //console.assert(phrase.charCodeAt(0) < MAX_ALPHA_CODE);
        var code = MAX_ALPHA_CODE+1, i;
        for (i=1; i<data.length; i++) {
            currChar=data.charAt(i);
            //console.assert(currChar.charCodeAt(0) < MAX_ALPHA_CODE);
            if (dict.hasOwnProperty(phrase + currChar)) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase);
                if (code < MAX_OUTPUT_CODE) {
                    // only grow the dictionary if we haven't reached max size
                    dict[phrase + currChar] = String.fromCharCode(code);
                    code++;
                    if (code===0xD800) { code=0xE000; }//UTF-16 hack
                }
                if (code===MAX_OUTPUT_CODE && CLEAR_FULL_DICT) {
                    out.push(String.fromCharCode(MAX_ALPHA_CODE /* "clear" */));
                    dict = {};
                    code = MAX_ALPHA_CODE+1;
                }
                phrase=currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase);

        // convert array of numbers to string
        var result = out.join('');
        if (optToUTF8) { result = encode_utf8(result); }
        return result;
    }

    // Decompress an LZW-encoded string
    function lzw_decode(s, optFromUTF8) {
        var data = s + "";
        if (optFromUTF8) { data = decode_utf8(data); }
        var dict = {};
        var currChar = data.charAt(0);
        var oldPhrase = currChar;
        var out = [currChar];
        var code = MAX_ALPHA_CODE+1;
        var phrase, i;
        for (i=1; i<data.length; i++) {
            var currCode = data.charCodeAt(i);
            if (currCode < MAX_ALPHA_CODE) {
                phrase = data.charAt(i);
            } else if (currCode === MAX_ALPHA_CODE /* "clear" */) {
                dict = {};
                code = MAX_ALPHA_CODE+1;
                currChar = oldPhrase = data.charAt(++i);
                out.push(currChar);
                continue;
            } else {
                // note the special 'one greater than dict length' case.
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            if (code < MAX_OUTPUT_CODE) {
                dict[code] = oldPhrase + currChar;
                code++;
                if (code===0xD800) { code=0xE000; }//UTF-16 hack
            }
            oldPhrase = phrase;
        }
        return out.join("");
    }

    return {
        encode: lzw_encode,
        decode: lzw_decode
    };
});
