window.onload = function() {
    var random = new this.Image();
    random.src = "RandomData.png";
    random.onload = main(random);
};


function main(random) {
    const canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");

    if(!gl) {
        error(
            "no gl"
        );
        return;
    }

    const particles = 200;
    const dataPoints = {x: 6, y: 1};

    const dataOffset = {x: 5, y: 5};
    const dataScale = {x: 10, y: 10};

    const dataResolution = [
        particles * dataPoints.x * dataOffset.x * dataScale.x,
        particles * dataPoints.y * dataOffset.y * dataScale.y
    ];

        
    const programs = [
        getProgram(gl, dataVert, dataFrag_resetCalc),
        getProgram(gl, dataVert, dataFrag_accelSpeedCalc),
        getProgram(gl, dataVert, dataFrag_growthAlphaCalc),
        getProgram(gl, dataVert, dataFrag_positionCalc),
        getProgram(gl, dataVert, dataFrag_rotationWidthCalc),
        getProgram(gl, dataVert, dataFrag_colorCalc),
        getProgram(gl, vertex2D, frag2D),
    ];


    let positionBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, ...dataResolution);

    var texcoordBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, 1, 1)

    var textures = [];
    var framebuffers = [];

    for (var i = 0; i < 2; ++i) {
        var texture = createEmptyTexture(gl, ...dataResolution);
        textures.push(texture);
        framebuffers.push(makeFramebuffer(gl, texture));
    }


    programs.forEach( prog => {
        gl.useProgram(prog);
        const resize = createResizeFunction(gl, prog, "u_resolution");
        const clear = createClearFunction(gl, [0, 0, 0, 0]);
    
        attributeVerteces2D(gl, prog, "a_position", positionBuffer);    
        attributeVerteces2D(gl, prog, "a_texCoord", texcoordBuffer);
    
        function vec2(arg, ...data) {
            gl.uniform2f(uniLoc(gl, prog, arg), ...data);
        }
        function vec4(arg, ...data) {

        }

        function f(arg, data) {
            gl.uniform1f(uniLoc(gl, prog, arg), data);
        }

        //gl.uniform2f(uniLoc(gl, prog, "u_textureSize"), image.width, image.height);

        vec2("dataResolution", ...dataResolution);
        vec2("randomResolution", random.width, random.height);
        vec2("canvasResolution", canvas.width, canvas.height);
        f("alphaScale", 5.0);
        f("widthScale", 4.0);

        // random reset values
        uniform vec4 randomPosition;
        uniform vec4 randomDirection;
        uniform vec4 randomSpeed;
        uniform vec4 randomAccel;
        
        // the following are a bit rearranged from their color counterparts
        uniform vec4 randomGrowthWidth;
        uniform vec4 randomDirection;
    
        uniform vec4 randomColorHS;
        uniform vec4 randomColorVA;
        uniform vec4 randomAlphaSpeedMax;

        
        uniform vec2 currentCalculation;
        uniform vec2 dataOffset;
        uniform vec2 dataScale;

        uniform vec2 dataResolution;
        uniform vec2 randomResolution;

        // used to flip y on canvas draw vs buffer draw
        uniform float invertY;

        attribute vec4 a_position;
        attribute vec4 a_randomSeed;

    });


    
    uniform int frameCount;
    uniform float delta;
}