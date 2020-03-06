
// update colors (to read and calculate)

// colors (data) (1-4):
//   color0: reset (0-1)
//   color1: updateSpeed (accel(r*g), speed(b*a))
//   color2: growthAlpha (growth(r*g) alphaSpeed, alphaMax);
//   color3  position ( x(r*g), y(b*a) // pixel space )
//   color4  rotationWidth ( x(r*g), y(b), width), //x(0-tau), y(0-tau), width(0-max))
//   color5  colorHLSA


const commonFrag_vars = `

    #define TAU 6.2831853072;

    uniform int frameCount;
    uniform float delta;
    const float colorMaxVal = 255.0; // does this need to be 255.0?

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
    uniform float alphaScale;
    uniform float widthScale;

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
`;

const commonFrag_functions = `

// these should all be inlined on compile time

vec2 clipSpace(vec2 pixelSpace, vec2 resolution) {
    return ((pixelSpace/resolution) * 2.0) - 1.0;
}

// serf & derf: serializes and deserialzes a float
float serf(float out) { return out / colorMaxVal; }
float derf(float in) { return in * colorMaxVal; }

float rescaleTo(float in, float newRange) { return (in/colorMaxVal) * newRange; }


vec2 serf2(float sum) {
    /*
        * y = n / rowTotal
        * x = n - ( y * colTotal )
        * rowTotal,colTotal = colorMaxVal+1
        * convertRGBA coords to glCoord: coords/colorMaxVal;
    */
    vec2 out = vec2(0.0, floor(sum/colorMaxVal+1.0));
    out.x = sum - (out.y * colorMaxVal+1.0);
    return out / colorMaxVal;
}

vec4 serf4(vec2 sums) {
    return vec4(serf2(sums.x).xy, serf2(sums.y).zw);
}


float derf2(vec2 in) {
    /*
    *   glColor: 0.0-1.0 inclusive
    *   rgbaColor: 0-colorMaxVal (inclusive, exclusive)
    *   two-rgbaColor colorspace: [0-colorMaxVal+1]x[0-colorMaxVal+1] (inclusive, exclusive)
    *   glColor=>rgbaColor: glColor * colorMaxVal
    *   rgbaColorx2 num =>  (rgbaColor.x * colorMaxVal+1) + rgbaColor.y;
    */
    vec2 rgbaColor2 = in * colorMaxVal+1.0;
    return (rgbaColor2.x * colorMaxVal) + rgbaColor.y;
}

vec2 der4(vec4 in) {
    /*
    *   glColor: 0.0-1.0 inclusive
    *   rgbaColor: 0-colorMaxVal (inclusive, exclusive)
    *   two-rgbaColor colorspace: [0-colorMaxVal+1]x[0-colorMaxVal+1] (inclusive, exclusive)
    *   glColor=>rgbaColor: glColor * colorMaxVal
    *   rgbaColorx2 num =>  (rgbaColor.x * colorMaxVal+1) + rgbaColor.y;
    */
    return vec2(derf2(in.xy), derf2(in.zw));
}

// check these over
// deserializes a vec2 representing a min-max range. Calculates and returns float
float derfThenCalcRange2(float random, vec2 derfRangeMinMax){
    vec2 range = vec2(derf(derfRange.x), derf(derfRange.y));
    return serf(range.x + (random * range.y));
}

// deserializes a vec4 representing a min-max range . Calculates and returns float
float derfThenCalcRange4(float random, vec4 derfRange){
    vec2 range = vec2(derf2(derfRange.xy), derf2(derfRange.zw));
    return serf(range.x + (random * range.y));
}

// get the reset Cell
float getReset() {
    return texture2D(dataTexture, v_resetCoord.x, v_resetCoord.y).x;
}

vec4 getDataColor(vec2 coord) {
    return texture2D(dataTexture, coord.x, coord.y);
}

vec4 getRandomVals() {
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

//https://stackoverflow.com/a/17897228
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

`;

