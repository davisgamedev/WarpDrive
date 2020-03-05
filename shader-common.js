
// update colors (to read and calculate)

// colors (data) (1-4):
//   color0: reset (0-1)
//   color1: updateSpeed (accel(r*g), speed(b*a))
//   color2: growthAlpha (growth(r*g) alphaSpeed, alphaMax);
//   color2  position ( x(r*g), y(b*a) // pixel space )
//   color3  rotationWidth ( x(r*g), y(b), width), //x(0-tau), y(0-tau), width(0-max))
//   color4  colorHLSA


const commonFrag_vars = `

    #define TAU 6.2831853072;

    uniform int frameCount;
    uniform float delta;
    uniform float colorStep = 1000.0; // does this need to be 255.0?

    uniform sampler2D randomTexture;
    uniform sampler2D dataTexture;

    uniform vec2 dataResolution;
    uniform vec2 randomResolution;
    uniform vec2 canvasResolution;

    varying vec2 v_randomFetchCoord;

    // data color coordinates
    varying vec2 v_resetCoord;
    varying vec2 v_accelSpeed;
    varying vec2 v_growthAlphaCoord;
    varying vec2 v_positionCoord;
    varying vec2 v_rotationWidthCoord;
    varying vec2 v_colorCoord;

    // Scales, can add more
    uniform float alphaScale = 5.0;
    uniform float widthScale = 4.0;

    // random reset values
    uniform vec4 randomPosition;
    uniform vec4 randomDirection;
    uniform vec4 randomSpeed;
    uniform vec4 randomAccel;
    
    // the following are a bit rearranged from their color counterparts
    uniform vec4 randomGrowthWidth;
    uniform vec4 randomDirection;

    uniform vec4 randomColorHS;
    uniform vec4 randomColorBA;
    uniform vec4 randomAlphaSpeed;
`;

const commonFrag_functions = `

// these should all be inlined on compile time

vec2 clipSpace(vec2 pixelSpace, vec2 resolution) {
    return ((pixelSpace/resolution) * 2.0) - 1.0;
}

// serf & derf: serializes and deserialzes a float
float serf(float out) { return out / colorStep.0; }
float derf(float in) { return in * colorStep.0; }


vec2 serf2(float sum) {
    /*
        * y = n / rowTotal
        * x = n - ( y * colTotal )
        * rowTotal,colTotal = colorStep+1
        * convertRGBA coords to glCoord: coords/colorStep;
    */
    vec2 out = vec2(0.0, floor(sum/colorStep+1.0));
    out.x = sum - (out.y * colorStep+1.0);
    return out / colorStep.0;
}


float derf2(vec2 in) {
    /*
    *   glColor: 0.0-1.0 inclusive
    *   rgbaColor: 0-colorStep (inclusive, exclusive)
    *   two-rgbaColor colorspace: [0-colorStep+1]x[0-colorStep+1] (inclusive, exclusive)
    *   glColor=>rgbaColor: glColor * colorStep
    *   rgbaColorx2 num =>  (rgbaColor.x * colorStep+1) + rgbaColor.y;
    */
    vec2 rgbaColor2 = in * colorStep+1.0;
    return (rgbaColor2.x * colorStep.0) + rgbaColor.y;
}

// check these over
float calcSerf_range(float random, vec2 derfRange){
    vec2 range = vec2(derf(derfRange.x), derf(derfRange.y));
    return serf(range.x + (random * range.y));
}

float calcSerf_range2(float random, vec2 derfRange){
    vec2 range = vec2(derf(derfRange.x), derf(derfRange.y));
    return serf2(range.x + (random * range.y));
}

float calcSerf2_range2(float random, vec2 derfRange){
    vec2 range = vec2(derf2(derfRange.xy), derf2(derfRange.zw));
    return serf2(range.x + (random * range.y));
}


// get the reset Cell
float getReset() {
    return texture2D(dataTexture, v_resetCoord.x, v_resetCoord.y).x;
}

float getDataColor(vec2 coord) {
    return texture2D(dataTexture, coord.x, coord.y);
}

float getRandomVals() {
    return texture2D(randomTexture, v_randomFetchCoord.x, v_randomFetchCoord.y);
}

// this is so cool and so easy
float writeColor(updateColor, resetColor) {
    float reset = getReset(); // 1: reset, 0: don't, 1-reset: update

    // holds onto resetColor if reset, or wipes the color
    // does the inverse to the update color
    resetColor *= reset;
    updateColor *= (1-reset);

    // now just add the two, it will be either the color or 0
    gl_fragColor = resetColor + updateColor;
}

`;

