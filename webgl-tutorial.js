/*
    laser params:


    this.from; -float 0-1024
    this.length; -float 0-1024
    this.dirs = new Array(subLasers).fill(0);
    - array of 5-10, 0-6.28, all varying
    - or, numbers all less than 360
    -   could we have

    this.speed; this.accel; this.growth;

    this.color;
    this.width;
    this.alpha;

    color: hue, brightness
    color: hue(r), b(g), alpha(b), width(a)

    speed, accel, and groth can just have values 0-255 that are mapped

    readonly
    Tex0: randomSource: xcoord(scaled) (r+g), ycoord(scaled, b+a)

    pingpong
    Tex1, data: from(r*g)+length(b*a)
    Tex2, update: direction(r), speed(g), accel(b), growth(a)
    Tex3: hue(r), b(g), alpha(b), width(a)

*/

window.onload = function() {

    var image = new this.Image();
    image.src = "leaves.png";
    image.onload = () => this.render(image);

}

function render(image) {
    
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
    var prog = getProgram(gl, vertexShader2d, kernelfragShader); 
   
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

    let resLoc = uniLoc(gl, prog, "u_resolution");
    
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

    gl.uniform2f(resLoc, width, height);

    // Tell webgl the viewport setting needed for framebuffer.
    gl.viewport(0, 0, width, height);
    }

    function drawWithKernel(kernel) {
        setKernel(kernel);
        setKernelWeight(computeKernelWeight(kernel));

        draw(gl, 6);
    }
}