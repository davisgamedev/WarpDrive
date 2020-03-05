/*
    basic pipeline:
    updatePrograms(vert, currentCalcfrag) x numCalculations  => draw
*/

// NOTES:
/*
    vertShader

    vec2 currentCalculation (0-numData, 1);
    vec2 dataSize (numData, 0)
    
    vec2 offSet (0, 0);
    vec2 dataScale (w, h) 
        size of data blocks (pixels)
        1, 1, for efficiency

    vec4 a_position(x, y, index_x, index_y):
        x and y will always be 0-1
        index_x, index_y will be the start of the current cell

    vec2 position
        will be calcualted as:
        (0-1, 0-1) + index + offset + currentCalc, adjusted to dataScale
            (a_position.xy + a_position.zw 
                + offSet + currentCalculation) * dataScale;
        output to gl_Position in clipspace

    attribute vec4 a_randomSeed 
        (random x, random y, salt x (0-100), salt y(0-100))
            accesses a random coordinate * framerate + salt + vertex
            unique coord each frame + calculation
            add salt to prevent any accidental skips (overkill lol)

    varying vec2 v_randomFetchCoord;
        calculated as:
            vec2 frameIndex = (0.0, floor(frameCount/randomresolution.x));
            frameIndex.x = frameCount - (frameIndex.y * randomResolution.y);
            vec2 initRandomPosition = randomSeed.xy * randomResolution + randomSeed.zw;
            v_randomFetchCoord = clipSpace(initPosition + frameIndex);
                
*/

const dataVert = `

    uniform vec2 currentCalculation;
    uniform vec2 offSet;
    uniform vec2 dataScale;

    uniform vec2 dataResolution;
    uniform vec2 randomResolution;

    // used to flip y on canvas draw vs buffer draw
    uniform float invertY;

    attribute vec4 a_position;
    attribute vec4 a_randomSeed;

    varying vec2 v_randomFetchCoord;

    varying vec2 v_resetCoord;
    varying vec2 v_accelSpeedCoord;
    varying vec2 v_growthAlphaCoord;
    varying vec2 v_positionCoord;
    varying vec2 v_rotationWidthCoord;
    varying vec2 v_colorCoord;

    vec2 clipSpace(vec2 pixelSpace, vec2 resolution) {
        return ((pixelSpace/resolution) * 2.0) - 1.0;
    }

    void main() {

        // set data locations

        vec2 dataStep = clipSpace(dataScale.x, 0);

        // colors 0-5
        v_initCoord = clipSpace(a_position.xy + a_position.zw 
            + offSet) * dataScale);
        
        v_resetCoord =                 v_initCoord + (dataStep * 0.0)
        v_accelSpeedCoord =            v_initCoord + (dataStep * 1.0);
        v_growthAlphaCoord =           v_initCoord + (dataStep * 2.0);
        v_positionCoord =              v_initCoord + (dataStep * 3.0);
        v_rotationWidthCoord =         v_initCoord + (dataStep * 4.0);
        v_colorCoord =                 v_initCoord + (dataStep * 5.0);

        // set random location
        vec2 frameIndex = (0.0, floor(frameCount/randomresolution.x));
        frameIndex.x = frameCount - (frameIndex.y * randomResolution.y);
        vec2 initRandomPosition = randomSeed.xy * randomResolution + randomSeed.zw;
        v_randomFetchCoord = clipSpace(initPosition + frameIndex, randomResolution);

        // set vertex location
        v_positionPS = (a_position.xy + a_position.zw 
            + offSet + currentCalculation) * dataScale;
        gl_Position = clipSpace(v_positionPS, dataResolution);

    }
`;

// checks for resets by calculation position and updates
const dataFrag_resetCalc = `
    
    ${commonFrag_vars}
    ${commonFrag_functions}

    void main() {
        // hard coded positions we know, so, this might mess up if we change things
        // basically the next data location is positionPS + dataScale

        vec4 position = getDataColor(v_positionCoord);
        
        float posx = derf2(position.xy);

        //if posx > canvasWidth we need to reset
        // pos/width, 0 if <, 1 if >

        gl_FragColor = floor(posx/canvasResolution.x);
    }
`;



const dataFrag_speedCalc = `
    
    ${commonFrag_vars}
    ${commonFrag_functions}

    void main() {
        
        /*
            * color1: update (accel(r*g), speed(b*a))

            * sketch logic:
            *   this.speed += this.accel * dt;
            *   this.growth += this.accel * dt;
        */

        vec4 accelSpeed = getDataColor(v_accelSpeedCoord);
        vec4 randomVals = getRandomVals();
        
        float accel = derf2(update.xy);
        float speed = derf2(update.zw);

        float resetAccel = derf2(randomAccel.xy) + (randomVals.x  * derf2(randomAccel.zw));
        float resetSpeed = derf2(randomSpeed.xy) + (randomVals.x  * derf2(randomSpeed.zw));

        vec4 updateColor = vec4(accelSpeed.xy, serf2(speed + (accel * delta)));
        vec4 resetColor = vec4(serf2(resetAccel), serf2(resetSpeed));

        writeColor(updateColor, resetColor);
    }
`;

const dataFrag_growthAlphaCalc = `

    ${commonFrag_vars}
    ${commonFrag_functions}

    void main() {

        /*
        * color2: growthAlpha (growth(r*g) alphaSpeed, alphaMax);
        *
        * this.growth += this.accel * dt;
        * if(this.alpha < this.alphaMax) this.alpha += this.alphaSpeed * dt;
        */
        
        vec4 growthAlphaColor = getDataColor(v_growthAlphaCoord);

        vec4 randomVals = getRandomVals();

        float growth = derf2(growthAlphaColor.xy) + (derf2(accelSpeedColor.xy) * delta);

        /*
        * Alpha will need to be updated in colorCalc
        */

        vec4 updateColor = vec4(serf2(growth).xy, growAlphaColor.zw);
        vec4 resetColor = vec4(
                serf2(
                    randomGrowthWidth.x + (randomVals.x * randomGrowthWidth.y)
                ).xy,
                serf(randomAlphaSpeed.x + (randomVals.))
        );

        writeColor(updateColor, resetColor);
    }
`;