window.onload = function() {

    var image = new this.Image();
    image.src = "leaves.png";
    image.onload = () => this.render(image);

}

function render() {
    
    const canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");

    if(!gl) {
        error(
            "no gl"
        );
        return;
    }
        
    let translation = [0, 0];
    let width = 100;
    let height = 30;
    let color = [Math.random(), Math.random(), Math.random(), 1];


    var prog = getProgram(gl, vertexShader2d, fragmentShader2d); 
    gl.useProgram(prog);

    const resize = createResizeFunction(gl, prog, "u_resolution");
    const clear = createClearFunction(gl, [0, 0, 0, 0]);

    attributeVerteces2D(gl, prog, "a_position", positionBuffer);

    let positionBuffer = makeBuffer(gl);
    createRectangleData(gl, 10, 10, 80, 20);

    let colorSet = createSetData_4f_v(gl, program, "u_color");
    colorSet(0, 1, 0, 1);
}
