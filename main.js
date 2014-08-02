if (!Detector.webgl) Detector.addGetWebGLMessage();

var Mole = function(radius) {
  var capsuleGeometry = new THREE.CylinderGeometry(radius, radius, radius * 2, 16);
  capsuleGeometry.merge(new THREE.SphereGeometry(radius, 16, 12),
                        new THREE.Matrix4().makeTranslation(0, radius, 0));
  this.mesh = new THREE.Mesh(capsuleGeometry, new THREE.MeshPhongMaterial({
    color: 0x994c00, specular: 0x444444, emissive: 0x994c00
  }));
  this.state = 0;
  this.change();
};

Mole.prototype = {
  tick: function() {
    this.mesh.position.y += (this.dest - this.mesh.position.y) / 4;
    this.count--;
    if (this.count == 0) this.change();
  },
  change: function() {
    switch(this.state) {
    case 0:
      this.dest = -120;
      break;
    case 2:
      this.dest = 0;
      break;
    }
    this.count = Math.floor(Math.random() * 60) + 1;
    this.state++;
    if (this.state == 4) this.state = 0;
  }
};

function createGround() {
  var groundBSP = new ThreeBSP(new THREE.Mesh(new THREE.PlaneGeometry(1000, 800)));
  var sphere = new THREE.Mesh(new THREE.SphereGeometry(60, 16, 12));
  for (var i = 0; i < 9; ++i) {
    sphere.position.set((i % 3 - 1) * 200, (Math.floor(i / 3) - 1) * 200, 0);
    groundBSP = groundBSP.subtract(new ThreeBSP(sphere));
  }
  var ground = groundBSP.toMesh(new THREE.MeshPhongMaterial({
    color: 0x40621d, specular: 0x444444, emissive: 0x40621d
  }));
  ground.geometry.computeVertexNormals();
  ground.rotation.x = - Math.PI / 2;  
  ground.position.y = - 30;
  return ground;
}

var scene = new THREE.Scene();

var moles = [];
for (var i = 0; i < 9; ++i) {
  var mole = new Mole(50);
  mole.mesh.position.set((i % 3 - 1) * 200, 0, (Math.floor(i / 3) - 1) * 200);
  moles.push(mole);
  scene.add(mole.mesh);
}

scene.add(createGround());

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(-1000, 1000, 500);
scene.add(light);

var camera = new THREE.PerspectiveCamera(30,
                                         window.innerWidth / window.innerHeight,
                                         5,
                                         3000);
camera.position.set(0, 500, 800);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColorHex(0x7ec0ee);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
stats.domElement.style.left = '0px';
document.body.appendChild(stats.domElement);

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function vectorToString(vector) {
  return "(" + vector[0].toFixed(1) + ", "
             + vector[1].toFixed(1) + ", "
             + vector[2].toFixed(1) + ")";
}

var controller = new Leap.Controller();
(function animate() {
  requestAnimationFrame(animate);
  
  moles.forEach(function(mole) {
    mole.tick();
  });

  var frame = controller.frame();
  for (var i = 0; i < frame.hands.length; i++) {
    var hand = frame.hands[i];
    console.log("Hand ID: " + hand.id);
    console.log("Palm position: " + vectorToString(hand.palmPosition) + " mm");
    console.log("Palm normal: " + vectorToString(hand.palmNormal) + " mm");
    console.log("Palm velocity: " + vectorToString(hand.palmVelocity) + " mm");
  }

  renderer.render(scene, camera);
  stats.update();
})();
