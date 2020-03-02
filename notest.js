
// laser params:


// this.from; -float 0-1024
// this.length; -float 0-1024
// this.dirs = new Array(subLasers).fill(0);
// - array of 5-10, 0-6.28, all varying
// - or, numbers all less than 360
// -   could we have

// this.speed; this.accel; this.growth;

// this.color;
// this.width;
// this.alpha;

// color: hue, brightness
// color: hue(r), b(g), alpha(b), width(a)

// speed, accel, and groth can just have values 0-255 that are mapped

// readonly
// Tex0: randomSource: xcoord(scaled) (r+g), ycoord(scaled, b+a)

// pingpong
// Tex1, data: from(r*g)+length(b*a)


// Tex2, update: direction(r), speed(g), accel(b), growth(a)


// we need two calls, and we always update first.
// data texture, where we read and write info
// draw texture, where we interpolate all drawing info


const tex3 = `

    // we can do all the math in the shader including trig
    // but we do have to convert all the texture data set in update
    // from reading textures. luckily, the 

    Tex1, data: from(r*g)+length(b*a)

    Tex2, update: direction(r), speed(g), accel(b), growth(a)

    Tex3: draw: hue(r), bright(g), alpha(b), width(a)


    so if we create the vertex  positions here,
    and data could be passed in

    // update position buffer
        // aligns specific pixels to update on calcFrame
        // sends color data to frag shader which simply writes the data (color)

    // vertex update shader:
    

    // vertex draw shader:
        - calculate vertex positions of line-frags
         -> only DESERIALIZE data

         will need: 
            - data/Pos texture: from&length
            - draw texture: hue/bright/alpha/ and width



    okay stuck in the middle of i/o and my head hurts. im getting the feeling that
    in update, we might need to set multiple colors in the frag? not sure how
    we'll do that. Also, probably simply but we'll need to assign lookup locations
    for draw texture, shouldn't be too difficult

    setting multiple data in vertex... can we split? or maybe create more frags?
        or no, we can interpolate each area. we aren't limited to one pixel
        can we gradient and read that way?
        im so confused i need to put this down

    we should take a look at our old c++ opengl stuff since we seem to be confused
    with vertex vs fragment color



    // text coordinates
    varying vec2 v_texCoord



    vertex shader:
         attr vec



    //     scale points by a

`;





const vertexShader2d = `

    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;
    uniform float u_flipY;

    varying vec2 v_texCoord;

    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
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

const avgLeftRightPixel = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;
    uniform float u_flipY;

    varying vec2 v_texCoord;

    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
    }
`;








