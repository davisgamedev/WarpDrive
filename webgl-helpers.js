
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

function createSetData1f(gl, prog, argName) {
    argLoc = uniLoc(gl, prog, argName);
    return (val) => gl.uniform1f(argLoc, val);
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

// kernel logic
function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}

function drawWithKernel(gl, prog, kernel=kernels.normal) {
    gl.uniform1fv(
        uniLoc(gl, prog, "u_kernel[0]"),
        kernel
    );
    draw(gl, 6);
}

const kernels = {
    normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ],
      gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
      ],
      gaussianBlur2: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
      ],
      gaussianBlur3: [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0
      ],
      unsharpen: [
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
      ],
      sharpness: [
         0,-1, 0,
        -1, 5,-1,
         0,-1, 0
      ],
      sharpen: [
         -1, -1, -1,
         -1, 16, -1,
         -1, -1, -1
      ],
      edgeDetect: [
         -0.125, -0.125, -0.125,
         -0.125,  1,     -0.125,
         -0.125, -0.125, -0.125
      ],
      edgeDetect2: [
         -1, -1, -1,
         -1,  8, -1,
         -1, -1, -1
      ],
      edgeDetect3: [
         -5, 0, 0,
          0, 0, 0,
          0, 0, 5
      ],
      edgeDetect4: [
         -1, -1, -1,
          0,  0,  0,
          1,  1,  1
      ],
      edgeDetect5: [
         -1, -1, -1,
          2,  2,  2,
         -1, -1, -1
      ],
      edgeDetect6: [
         -5, -5, -5,
         -5, 39, -5,
         -5, -5, -5
      ],
      sobelHorizontal: [
          1,  2,  1,
          0,  0,  0,
         -1, -2, -1
      ],
      sobelVertical: [
          1,  0, -1,
          2,  0, -2,
          1,  0, -1
      ],
      previtHorizontal: [
          1,  1,  1,
          0,  0,  0,
         -1, -1, -1
      ],
      previtVertical: [
          1,  0, -1,
          1,  0, -1,
          1,  0, -1
      ],
      boxBlur: [
          0.111, 0.111, 0.111,
          0.111, 0.111, 0.111,
          0.111, 0.111, 0.111
      ],
      triangleBlur: [
          0.0625, 0.125, 0.0625,
          0.125,  0.25,  0.125,
          0.0625, 0.125, 0.0625
      ],
      emboss: [
         -2, -1,  0,
         -1,  1,  1,
          0,  1,  2
      ]
}
