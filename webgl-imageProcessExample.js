window.onload = function() {

    var image = new this.Image();
    image.src = "leaves.png";
    image.onload = () => this.render(image);

}


function imageProcesing(image) {
    
    const canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");

    if(!gl) {
        error(
            "no gl"
        );
        return;
    }
    
    //var prog = getProgram(gl, vertexShader2d, fragmentShader2d);   
    //var prog = getProgram(gl, vertexShader2d, avgLeftRightPixel); 
    var prog = getProgram(gl, vertexTextureShader2d, kernelfragShader); 
   
    let positionBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, image.width, image.height);

    var texcoordBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, 1, 1);

    var imageTexture = createImageTexture(gl, image);


    // create 2 textures and attach them to framebuffers.
    var textures = [];
    var framebuffers = [];

    

    for (var i = 0; i < 2; ++i) {
        var texture = createEmptyTexture(gl, image.width, image.height);
        textures.push(texture);
        framebuffers.push(makeFramebuffer(gl, texture));
    }

    let effects = [
        // kernels.gaussianBlur, 
        // kernels.emboss, 
        // kernels.gaussianBlur, 
        // kernels.unsharpen
        kernels.gaussianBlur3, kernels.gaussianBlur3,kernels.gaussianBlur3,kernels.emboss
    ];
    

    gl.useProgram(prog);
    const resize = createResizeFunction(gl, prog, "u_resolution");
    const clear = createClearFunction(gl, [0, 0, 0, 0]);

    attributeVerteces2D(gl, prog, "a_position", positionBuffer);
    attributeVerteces2D(gl, prog, "a_texCoord", texcoordBuffer);

    let setRes = createSetData_2f(gl, prog, "u_resolution");
    let setKernelWeight = createSetData_1f(gl, prog, "u_kernelWeight");
    let setKernel = createSetData_1f_v(gl, prog, "u_kernel[0]");


    gl.uniform2f(uniLoc(gl, prog, "u_textureSize"), image.width, image.height);


    // start with the original image
    drawTexture(gl, imageTexture);

    // don't y flip images while drawing to the textures
    //gl.uniform1f(flipY, 1);
    let flipY = createSetData_1f(gl, prog, "u_flipY");
    flipY(1);

    // loop through each effect we want to apply.
    for (var i = 0; i < effects.length; ++i) {
        // Setup to draw into one of the framebuffers.
        setFramebuffer(framebuffers[i % 2], image.width, image.height);
        drawWithKernel(effects[i]);
        drawTexture(gl, textures[i % 2]);
    }

    // finally draw the result to the canvas.
    flipY(-1);  // need to y flip for canvas
    setFramebuffer(null, canvas.width, canvas.height);
    drawWithKernel(kernels.normal);

    function setFramebuffer(fbo, width, height) {
        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        setRes(width, height);
        // Tell webgl the viewport setting needed for framebuffer.
        gl.viewport(0, 0, width, height);
    }

    function drawWithKernel(kernel) {
        setKernel(kernel);
        setKernelWeight(computeKernelWeight(kernel));
        draw(gl, 6);
    }
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
