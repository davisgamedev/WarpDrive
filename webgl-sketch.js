

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
    image.src = "RandomData.png";
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

    const vertexShader2d = `
        attribute vec2 a_position;

        // canvas resolution, remap clip to canvas pixel
        uniform vec2 u_resolution; 

        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;

        void main() {
            vec2 zeroToOne = a_position.xy / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            
            // pass texCoord to fragment shader to interpolate between verteces
            v_texCoord = a_texCoord;
        }
    `;

    const fragmentShader2d = `
        // sets float precision to medium-p(recision)
        precision mediump float;
    
        // texture
        uniform sampler2D u_image;

        // passed in from vertex shader
        varying vec2 v_texCoord;
    
        void main() {
            // lookup
            gl_FragColor = texture2D(u_image, v_texCoord);
        }
    `;
    
    var program = getProgram(gl, vertexShader2d, fragmentShader2d);    
    let buffer = makeBuffer(gl);

    // does this iife work here?
    window.onresize = (() => resize(gl, program, "u_resolution"))();

    
    let clear = createClear(gl, [0, 0, 0, 0]);
    clear();

    gl.useProgram(program);

    attributeVerteces2D(gl, program, "a_position");
    attributeVerteces2D(gl, program, "a_texCoord");

    let texture = createTexture(gl, image);


    for (var i = 0; i < 5; ++i) {
        // Setup a random rectangle
        // This will write to positionBuffer because
        // its the last thing we bound on the ARRAY_BUFFER
        // bind point
        setRectangle(
            gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

        // Set a random color.
        //gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

        draw(gl, 6);
    }
}