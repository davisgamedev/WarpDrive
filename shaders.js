/*
    basic pipeline:
    update => write => draw


    /// caculates data from previous state, and puts to middle buffer
    updateDataProgram 
        in: dataTexture (old data)
        out: middleDataBuffer (new data)

        
    /// passes new calculated data from middle texture back to data texture
    /// bit redundant, but has simplicity and purpose
    ///    a lot like myself, this is me, i am this program 
    writeDataProgram 
        in: middleDataBuffer (new data)
        out: dataTexture

    drawDataProgram
        in: dataTexture (current data)
        out: pretty pictures :D
*/

const updateDataVertShader = `

    // position(x, y, index_x, index_y)
    // x, y will change for each vert, ix, iy won't
    attribute vec4 a_position;

    // NO BECAUSE INDEX COULD BE ZERO
    // random x, random y, salt x (0-100), salt y(0-100)
    // accesses a random coordinate * framerate + salt + vertex
    //  unique coord each frame and vertex
    // add salt to prevent any accidental prime-number skips
    // overkill, but i'd love to never have to use another randomTexture
    attribute vec4 a_randomSeed;

    uniform vec2 dataResolution;
    varying vec4 v_totalPosition;

    attribute vec2 a_randomCoord;
    uniform vec2 randomResolution;
    varying vec2 v_randomFetchCoord;

    // used to flip y on canvas draw vs buffer draw
    uniform float invertY;
    
    // number of data 'cells' (colors) we are writing to the x++ position
    // just x for simplicity in frag shader, but could be expanded
    uniform float dataSizeX;

    uniform float frameCount;
    uniform float delta;


    vec2 clipSpace2(vec2 pixelSpace, vec2 resolution) {
        return ((pixelSpace/resolution) * 2.0) - 1.0;
    }

    vec4 clipSpace4(vec4 pixelSpace, vec4 resolution) {
        return ((pixelSpace/resolution) * 2.0) - 1.0;
    }


    void main() {



        // init position: randomxy + salt + index;
        vec2 randomCoord = vec2(a_randomSeed.xy * randomresolution)'
        randomCoord += a_randomSeed.zw + position.zw;

        // increment based on frameRate
        randomCoord += vec2(
                        mod(frameRate, randomResolution.x)
                        floor(frameRate / randomResolution.y));

        

        v_totalPosition.xy = a_position.zw + (a_position.xy - a_position.zw);
        v_totalPosition.zw = v_totalPosition.xy + vec2(dataSizeX, 1.0);
        v_totalPosition = clipSpace4(v_totalPosition, dataResolution.xyxy);

        
        vec2 pos = clipSpace4(a_position, dataResolution.xyxy);

        v_randomFetchCoord = clipSpace2(v_randomFetchCoord);

        gl_Position = vec4(pos.x, pos.y * invertY, pos.z, pos.w);

    }
`;

const updateDataFragShader = `

    #define PI 3.1415926538;

    uniform vec2 canvasResolution;

    uniform int frameCount;
    uniform float delta;

    uniform vec2 randomInitPosXRange;
    uniform vec4 randomDirectionRange;

    uniform vec4 randomLengthWidthRange;
    uniform vec4 randomAccelSpeedRange;
    uniform vec4 randomHueLightnessRange;

    uniform sampler2D randomTexture;
    uniform sampler2D dataTexture;

    // in, both scaled to clip space
    varying vec2 v_randomFetchCoord;
    varying vec4 v_totalPosition;

    uniform float dataSizeX; // step = size/res.x
    uniform vec2 dataResolution;


    // colors (data) (1-4):
    //   color1 out: update: (accel(r*g), speed, growth)
    //   color2 out: position
    //   color3 out: rotation
    //   color4 out: color


    vec4 colorAlgorithm(float i) {
        /*
            Sadly, we have to branch. But this shouldn't be too bad
                Each call branch is called exactly once per cell per unit
                So performance should still be parallel overall if compiler
                does static branching. If not, it shouldn't be too overwhelming
                a performance drop since this is only called 4 times per object
            However, we could do multiple passes for each calculation on 
                different frag shaders in the future to _ensure_ this is the case
        */

        // update and position are called first

        vec4 update_Color1 = texture2D(dataTexture, v_totalPosition.x, v_totalPosition.y);
        vec4 position_Color2 = texture2D(dataTexture, v_totalPosition.x, v_totalPosition.y);
        
        vec2 position = position_Color2.xz * position_Color2.yw * canvasResolution;
        int reset = int(position.x > canvasResolution.x || position.y > canvasResolution.y);
        
        vec4 randomSet = texture2D(randomTexture, v_randomFetchCoord.x, v_randomFetchCoord.y);
    
        if(i < 1) { // update color

            // update: (accel(r*g), speed, growth)

            vec4 updatedColor1 = vec4(
                update_Color1.x, update_Color1.y,
                update_Color1.z + (update_Color1.x * update_Color1.y * delta),
                update_Color1.w + (update_Color1.x * update_Color1.y * delta),
            );

            float resetAccel = randomSet.x * randomAccelSpeedRange.x + randomAccelSpeedRange.y;
            
            vec4 resetColor1 = vec4(
               mod(resetAccel, 255.0)/255.0
               mod(resetAccel, )

            )

            gl_fragColor = color1;

        }
        else if (i < 2) { // position color

        }
        else if (i < 3) { // rotation color

        }
        else if (i <= 4.0) { // hsl color

       }
    }

    // take in previous data, make changes, and pass the color
    void main() {

        float step = dataSizeX/resolution.x;
        colorNum = gl_FragCoord.x/step;

        

        gl_FragColor
    }


`;