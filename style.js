let cubes = [];
let bigCube;
let pulses = [];
let liquidRing;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Staying in HSB mode but restricting the range to blues/indigos
  colorMode(HSB, 360, 100, 100);
  
  bigCube = new ParticleCube(true); 
  liquidRing = new LiquidRing(); 
  
  for (let i = 0; i < 60; i++) {
    cubes.push(new ParticleCube(false));
  }
}

function draw() {
  background(2, 40, 8); // Very dark navy background

  bigCube.update();
  bigCube.display();
  
  liquidRing.update();
  liquidRing.display();
  
  for (let i = pulses.length - 1; i >= 0; i--) {
    pulses[i].update();
    pulses[i].display();
    for (let c of cubes) {
      let d = dist(c.pos.x, c.pos.y, pulses[i].x, pulses[i].y);
      if (abs(d - pulses[i].r) < 30) c.resetToHome();
    }
    if (pulses[i].lifespan <= 0) pulses.splice(i, 1);
  }

  for (let i = 0; i < cubes.length; i++) {
    for (let j = i + 1; j < cubes.length; j++) {
      checkCollision(cubes[i], cubes[j]);
    }
  }

  for (let c of cubes) {
    c.update();
    c.display();
  }
}

class LiquidRing {
  constructor() {
    this.radius = 240;
    this.numCubes = 120; 
    this.segments = [];
    for (let i = 0; i < this.numCubes; i++) {
      let angle = (TWO_PI / this.numCubes) * i;
      this.segments.push({
        pos: createVector(cos(angle) * this.radius, sin(angle) * this.radius, random(-25, 25)),
        vel: createVector(0, 0, 0),
        size: random(30, 55),
        angle: angle
      });
    }
  }

  update() {
    let mX = mouseX - width / 2;
    let mY = mouseY - height / 2;
    for (let i = 0; i < this.segments.length; i++) {
      let s = this.segments[i];
      let dToMouse = dist(s.pos.x, s.pos.y, mX, mY);
      if (dToMouse < 100) {
        let push = createVector(s.pos.x - mX, s.pos.y - mY).normalize().mult(2);
        s.vel.add(push);
      }
      let wobble = sin(frameCount * 0.05 + i * 0.3) * 10;
      let targetR = this.radius + wobble;
      let targetX = cos(s.angle + frameCount * 0.003) * targetR;
      let targetY = sin(s.angle + frameCount * 0.003) * targetR;
      let homeForce = createVector(targetX - s.pos.x, targetY - s.pos.y).mult(0.05);
      s.vel.add(homeForce);
      s.pos.add(s.vel);
      s.vel.mult(0.9); 
    }
  }

  display() {
    push();
    translate(0, 0, -400); 
    rotateX(HALF_PI);      
    for (let i = 0; i < this.segments.length; i++) {
      let s = this.segments[i];
      push();
      translate(s.pos.x, s.pos.y, s.pos.z);
      rotateZ(s.angle + frameCount * 0.02);
      
      // DARK BLUE TO INDIGO GRADIENT (Hue 200 to 275)
      let blueHue = map(sin(frameCount * 0.02 + i * 0.1), -1, 1, 200, 275);
      stroke(blueHue, 90, 100);
      strokeWeight(1);
      fill(0);
      box(s.size, 15, 15); 
      pop();
    }
    pop();
  }
}

class ParticleCube {
  constructor(isBig) {
    this.isBig = isBig;
    this.home = isBig ? createVector(0, 0, -400) : createVector(random(-width/2, width/2), random(-height/2, height/2), 50);
    this.pos = this.home.copy();
    this.vel = createVector(0, 0, 0);
    this.baseSize = isBig ? 180 : random(15, 25);
    this.size = this.baseSize;
    this.angleX = 0; this.angleY = 0;
    this.rotVelX = 0; this.rotVelY = 0;
  }
  bump() { this.size = this.baseSize * 1.3; }
  resetToHome() { this.vel.add(p5.Vector.sub(this.home, this.pos).limit(20)); }
  update() {
    if (!this.isBig) {
      let mVec = createVector(mouseX - width/2, mouseY - height/2, 50);
      let pDir = p5.Vector.sub(this.pos, mVec);
      if (pDir.mag() < 130) this.vel.add(pDir.normalize().mult(1.5));
      let rDir = p5.Vector.sub(this.home, this.pos);
      this.vel.add(rDir.normalize().mult(rDir.mag() * 0.0005));
      this.pos.add(this.vel);
      this.vel.mult(0.92);
      if (abs(this.pos.x) > width/2 + 50) this.pos.x *= -0.95;
      if (abs(this.pos.y) > height/2 + 50) this.pos.y *= -0.95;
      this.angleX += 0.01; this.angleY += 0.01;
    } else {
      this.angleX += this.rotVelX; this.angleY += this.rotVelY;
      this.rotVelX *= 0.95; this.rotVelY *= 0.95;
      this.size = lerp(this.size, this.baseSize, 0.1);
    }
  }
  display() {
    push(); translate(this.pos.x, this.pos.y, this.pos.z);
    rotateX(this.angleX); rotateY(this.angleY);
    
    // BLUE TO INDIGO GRADIENT for the cubes
    let blueHue = map(sin(frameCount * 0.03 + this.pos.x * 0.01), -1, 1, 200, 275);
    stroke(blueHue, 80, 100);
    
    strokeWeight(this.isBig ? 4 : 1.5);
    fill(0); box(this.size); pop();
  }
}

// Helper Functions
function checkCollision(c1, c2) {
  let dVec = p5.Vector.sub(c1.pos, c2.pos);
  let minD = (c1.size + c2.size) * 0.6;
  if (dVec.mag() < minD) {
    let overlap = minD - dVec.mag();
    c1.pos.add(dVec.copy().normalize().mult(overlap / 2));
    c2.pos.sub(dVec.copy().normalize().mult(overlap / 2));
    let temp = c1.vel.copy();
    c1.vel = c2.vel.copy().mult(0.8);
    c2.vel = temp.mult(0.8);
  }
}

function mousePressed() {
  if (dist(mouseX - width/2, mouseY - height/2, 0, 0) < 150) {
    pulses.push(new Pulse(0, 0));
    bigCube.bump();
  }
}

function mouseMoved() {
  bigCube.rotVelY += (mouseX - pmouseX) * 0.0003;
  bigCube.rotVelX -= (mouseY - pmouseY) * 0.0003;
}

class Pulse {
  constructor(x, y) { this.x = x; this.y = y; this.r = 0; this.lifespan = 255; }
  update() { this.r += 12; this.lifespan -= 3; }
  display() {
    push(); noFill(); strokeWeight(3);
    // Pulse also uses Indigo/Violet
    stroke(260, 80, 100, this.lifespan / 255);
    ellipse(this.x, this.y, this.r * 2); pop();
  }
}