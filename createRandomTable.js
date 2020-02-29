window.onload = function() {

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for(let x = 0; x < canvas.width; x++) {
        for(let y = 0; y < canvas.height; y++) {
            for(let c = 0; c < 4; c++) {
                imageData.data[(y * canvas.height*4) + (x*4) + c] = Math.floor(Math.random() * 256);
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.save();
}