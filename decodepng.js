define(['domReady!', 'img!drawing-json.png', './src/lzw', './lib/BlobBuilder', './lib/FileSaver'], function(document, image, LZW, BlobBuilder, saveAs) {
    document.body.appendChild(image);
    var canvas = document.createElement('canvas');
    // XXX this may not work on a retina machine.  Caveat user.
    canvas.width = image.width;
    canvas.height = image.height;
    var ctxt = canvas.getContext('2d');
    ctxt.drawImage(image, 0, 0);
    var idata = ctxt.getImageData(0, 0, canvas.width, canvas.height);
    console.assert(idata.width === image.width &&
                   idata.height === image.height);
    var bytes = '';
    var i, alpha;
    for (i=0; i < idata.width*idata.height*4; i+=4) {
        alpha = idata.data[i+3];
        //console.log(i, alpha);
        if (alpha != 255) break;
        bytes += String.fromCharCode(idata.data[i+0],
                                     idata.data[i+1],
                                     idata.data[i+2]);
    }
    // trim the end to the right length
    var lenMod3 = bytes.charCodeAt(0);
    console.assert(lenMod3 >=0 && lenMod3 <= 2, lenMod3);
    while (lenMod3 !== (bytes.length % 3)) {
        bytes = bytes.substring(0, bytes.length-1);
    }
    bytes = bytes.substring(1);
    // now lzw-decompress
    bytes = LZW.decode(bytes, true/*from utf-8*/);
    // validity check
    var obj = JSON.parse(bytes);
    // now save as a file!
    if (true) {
        var blob, blobUrl;
        try {
            blob = new window.Blob([bytes], {type:"text/plain;charset=ascii"});
        } catch (e) {
            var bb = new BlobBuilder();
            bb.append(bytes);
            blob = bb.getBlob("text/plain;charset=ascii");
        }
        saveAs(blob, 'drawing.json');
    } else {
        // use cut-and-paste to get this out.
        var div = document.createElement('pre');
        div.innerText = bytes;
        document.body.appendChild(div);
    }

});
