class Pyramid {
    constructor() {
        this.type='pyramid';
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // ok lets build it
        //side 1
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  0.5, 1.0, 0.5])
        // side 2
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0,  0.5, 0.0, 1.0,  0.5, 1.0, 0.5])
        // side 3
        gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
        drawTriangle3D([1.0, 0.0, 0.0,  0.5, 0.0, 1.0,  0.5, 1.0, 0.5])
        // bottom
        gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0,  0.5, 0.0, 1.0,  1.0, 0.0, 0.0])
    }
}