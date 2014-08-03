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
    this.count = Math.floor(Math.random() * 60) + 10;
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

function createCursor() {
  var circle = new THREE.Mesh(
    new THREE.CircleGeometry(50, 32),
    new THREE.MeshPhongMaterial({
      color: 0xdc143c,
      specular: 0x444444,
      emissive: 0xdc143c,
      transparent: true,
      opacity: 0.4
    })
  );
  circle.rotation.x = - Math.PI / 2;  
  return circle;
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
renderer.setClearColor(0x7ec0ee);
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

var cursors = {};  
var controller = new Leap.Controller().use('handEntry');
controller.setBackground(true);
controller.on('handFound', function(hand) {
  cursors[hand.id] = createCursor();
  scene.add(cursors[hand.id]);
}).on('handLost', function(hand) {
  scene.remove(cursors[hand.id]);
  delete cursors[hand.id];
}).connect();

(function animate() {
  requestAnimationFrame(animate);
  
  moles.forEach(function(mole) {
    mole.tick();
  });

  var frame = controller.frame();
  for (var i = 0; i < frame.hands.length; i++) {
    var hand = frame.hands[i];
    cursors[hand.id].position.set(hand.palmPosition[0] * 2,
                                  hand.palmPosition[1] * 3 - 300,
                                  hand.palmPosition[2] * 2);
  }

  renderer.render(scene, camera);
  stats.update();
})();
