
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function getProgram(gl, vertexShader, fragmentShader) {
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
    return program;
}

function makeBuffer(gl) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    return buffer;
}

function makeFramebuffer(gl, texture) {
    let frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    if(texture) gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    return frameBuffer;
}

function uniLoc(gl, program, argString){
    return  gl.getUniformLocation(program, argString);
}

function createSetData_1f(gl, prog, argName) {
    let argLoc = uniLoc(gl, prog, argName);
    return (val) => gl.uniform1f(argLoc, val);
}

function createSetData_1f_v(gl, prog, argName) {
    let argLoc = uniLoc(gl, prog, argName);
    return (val) => gl.uniform1fv(argLoc, val);
}

function createSetData_2f(gl, prog, argName) {
    let argLoc = uniLoc(gl, prog, argName);
    return (...data) => gl.uniform2f(argLoc, ...data);
}

function createSetData_4f_v(gl, prog, argName) {
    let argLoc = uniLoc(gl, prog, argName);
    return (...data) => gl.uniform_4f_v(argLoc, ...data);
}


function createClearFunction(gl, color) {
    gl.clearColor(color[0], color[1], color[2], color[3]);
    const clear = () => gl.clear(gl.COLOR_BUFFER_BIT);
    clear();
    return clear 
}

function createResizeFunction(gl, program, resUniformArg) {
    
    const resize = () => {
        // Lookup the size the browser is displaying the canvas.
        var displayWidth  = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        if (canvas.width  !== displayWidth ||
            canvas.height !== displayHeight) {

            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
        //testasdsa

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(
            gl.getUniformLocation(program, resUniformArg), 
            gl.canvas.width, 
            gl.canvas.height);
    };
    resize();
    window.onresize = resize;
    return resize;
};

function attributeVerteces2D(gl, program, locationString, buffer) {
    const location = gl.getAttribLocation(program, locationString);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);    
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
}


function createImageTexture(gl, image) {
    var imageTexture = createNewTexture(gl);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    return imageTexture;
}

function createEmptyTexture(gl, w, h) {
    let emptyTexture = createNewTexture(gl);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 
        w, h, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, null);
    return emptyTexture;
}

function createNewTexture(gl) {
    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}


function setData(gl, ...data) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...data]), gl.STATIC_DRAW);
}

function drawTexture(gl, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function draw(gl, count) {
    var primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, count);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
  }
  
  // Fill the buffer with the values that define a rectangle.
function createRectangleData(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    setData(gl, 
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,);
}

function drawScene() {

}
