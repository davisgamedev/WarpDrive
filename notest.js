
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

    // data textures
    Tex0: randomData
    Tex1, datacoords: from(r*g)+length(b*a)
    Tex2, update: direction(r), accel(g), speed(b),  growth(a)

    //colors(data)1-4
    //color1 out: update (accel r*g , speed, growth)
    //color2 out: position
    //color3 out: rotation
    //color4 out: color


    tex2: drawcoords
        => this can be passed into datacoords during the draw.
            => we can update the update buffers during the draw buffers
    

// we're going to have to do a lot of data calculations on the frament shader
// this shouyld still be okay since we're only calling it 4 or 5 times depending on
// how big the overall data is

    uniform vec2 startPostition


    color1: randomPosition, rg



    color1: color
    color2: position(from, to)
    color3: rotation1, r*g, rotationy(b), width(a)




    => rotation x needs more coordinates for more discrete and accurate values
    => rotation y will mostly be static, and doesnt need as discrete values






    process: raw data textures 
                update shaders: in(raw data textures), out(updateData texure)
                draw shaders: in(updateDataShaders), out(render, rawdata texture)


    Calc makedata: in-read random, in-read dataTexture(previous calculations), 
                out-write buffer1 for calc/update logic
    Calc writedata: in-read buffer1, out-write dataTexture (c)
            => copies frame buffer to texture (we might want to draw texture later)
    Draw: readData: in-read texture

    Draw data: -in-read buffer1 for draw logic, out-canvas



    META DATA IS PROVIDED BY JS
    DATA:
        -1f: INDEX
        -1f: DATA LENGTH
        -2F: DATA TEXT RESOLUTION


    CALC_PROGRAM:
        VERTEX (does most work)
            -3f in: RANDOM_INDEX, RANDOM_CURRENT, RANDOM_WRAP
                - row to use for random calls, this will loop
                - row is chosen randomly by js. row will start at a random
                    number, and then increment by a random number, less than half, looped
            - 2f var: laser_from, laser_to
                - calculated and stored plainly for ease of programming, will be
                    serialized and deserialized as necessary
            - 1f var: laser_dir
            - 3f var: speed, growth, accel
        
            - 4f out: position
            - 4f out: color


    Step 1, Metadata texture
    dataTexture: 

    calcDataVectorShader:
    v2f in: dataTexture resolution
    v4f in: color4: meta(rgba), r,g(readDataStart/index), b, a(dataLength)
        => input this color, we can tell it how big the data is (b), and where
            it's start position will be

        // if we want to generify and scale this:
        //  max is 255*255 data-actors (65k), by 255*255 data-size addresses
        //      => per input color, this is not limited by any means
        //      => we don't even techinically need this, but it's fun

        // so we get our index and data size from the provided "color" data
        //      we can then look up the data in the provided dataTexture

        // we provide the calculations for: 
        //  v4 meta1: meta lookup for drawDataTexture


        // 
        // uniform float[] data

    
    


    v4f out: 
    


    the drawing texture needs the from and length variables, which change dynamically
    this must be provided by the update texture

    the drawing texture also needs to have the color variable


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








