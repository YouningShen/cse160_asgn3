class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -2000]);
        this.up = new Vector3([0, 1, 0]);
    }
    // MOVEMENT
    // forward
    moveForward() {
        // set d
        let d = new Vector3();
        // d = at - eye
        d.set(this.at);
        d.sub(this.eye);
        // d = d.normalize()
        d = d.normalize();
        // eye = eye + d
        this.eye.add(d);
        // at = at + d
        this.at.add(d);
    }
    // backward
    // same as forward but subtracting d
    moveBackward() {
        // d = at - eye
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        // d = d.normalize()
        d = d.normalize();
        // eye = eye - d
        this.eye.sub(d);
        // at = at - d
        this.at.sub(d);
    }
    // left
    moveLeft() {
        // d = at - eye
        // let d = new Vector3();
        // d.set(this.at);
        let d = new Vector3(this.at.elements);
        d.sub(this.eye);
        // d = d.normalize()
        d = d.normalize();
        // d = d.cross(up)
        let n = Vector3.cross(this.up, d);
        // eye = eye + n
        this.eye.add(n);
        // at = at + n
        this.at.add(n);
    }
    // right
    // same as left but swap
    moveRight() {
        // d = at - eye
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        // d = d.normalize()
        d = d.normalize();
        // d = d.cross(up)
        let n = Vector3.cross(d, this.up);
        // eye = eye + n
        this.eye.add(n);
        // at = at + n
        this.at.add(n);
    }
    // ROTATION
    // left
    turnLeft() {
        // d = at - eye
        let atp = new Vector3();
        atp.set(this.at);
        atp.sub(this.eye);
        // plug into the formula for r
        let r = Math.sqrt(atp.elements[0] * atp.elements[0] + atp.elements[2] * atp.elements[2]);
        // plug into the formula for theta
        let theta = Math.atan2(atp.elements[2], atp.elements[0]);
        // theta to rad
        theta -= (5 * Math.PI / 180);
        // plug back into the formula for at
        atp.elements[0] = r * Math.cos(theta);
        atp.elements[2] = r * Math.sin(theta);
        // set
        this.at.set(atp);
        this.at.add(this.eye);
    }
    // right
    turnRight() {
        // d = at - eye
        let atp = new Vector3();
        atp.set(this.at);
        atp.sub(this.eye);
        // plug into the formula for r
        let r = Math.sqrt(atp.elements[0] * atp.elements[0] + atp.elements[2] * atp.elements[2]);
        // plug into the formula for theta
        let theta = Math.atan2(atp.elements[2], atp.elements[0]);
        // theta to rad
        theta += (5 * Math.PI / 180);
        // plug back into the formula for at
        atp.elements[0] = r * Math.cos(theta);
        atp.elements[2] = r * Math.sin(theta);
        // set
        this.at.set(atp);
        this.at.add(this.eye);
    }
}