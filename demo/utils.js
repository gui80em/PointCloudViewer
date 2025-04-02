function supportsTiff(callback) {
    const img = new Image();
    const tiffDataURI = "data:image/tiff;base64,SUkqAAgAAAASAP4ABQA=";
   
    img.onload = function() {
        callback(true);
    };
    
    img.onerror = function() {
        callback(false);
    };
    
    img.src = tiffDataURI;
}

window.supportsTiff = supportsTiff