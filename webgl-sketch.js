

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
    
  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  let positionBuffer = makeBuffer(gl);
  createRectangleData(gl, 0, 0, image.width, image.height);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = makeBuffer(gl);
  createRectangleData(gl, 0, 0, 1, 1);
  
  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  resize(gl, program, "u_resolution");

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

  // Turn on the teccord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);

    // for (var i = 0; i < 5; ++i) {
    //     // Setup a random rectangle
    //     // This will write to positionBuffer because
    //     // its the last thing we bound on the ARRAY_BUFFER
    //     // bind point
    //     createRectangleData(
    //         gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    //     // Set a random color.
    //     //gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    //     draw(gl, 6);
    // }
}