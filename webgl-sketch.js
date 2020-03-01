

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

    const vertexShader2d = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        // canvas resolution, remap clip to canvas pixel
        uniform vec2 u_resolution; 

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
        precision mediump float;

        // our texture
        uniform sampler2D u_image;
        
        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;
        
        void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
        }
    `;
    
    var program = getProgram(gl, vertexShader2d, fragmentShader2d);    
   
    let positionBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, image.width, image.height);

    var texcoordBuffer = makeBuffer(gl);
    createRectangleData(gl, 0, 0, 1, 1);

    var texture = createTexture(gl, image);

    const resize = createResizeFunction(gl, program, "u_resolution");
    const clear = createClearFunction(gl, [0, 0, 0, 0]);

    gl.useProgram(program);
    attributeVerteces2D(gl, program, "a_position", positionBuffer);
    attributeVerteces2D(gl, program, "a_texCoord", texcoordBuffer);
  
    draw(gl, 6);
}