// Place this in an HTML file with three.js loaded
const vertices = [
  {x: 1, y: 1, z: 0, label: "flup-plus"},
  {x: -1, y: 1, z: 0, label: "flup-minus"},
  {x: 0, y: -1, z: 1, label: "cflup-n"}
];

const edges = [
  [0, 1], [1, 2], [2, 0]
];

// ...initialize three.js scene...

vertices.forEach(v => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({color: 0x00ff00})
  );
  sphere.position.set(v.x, v.y, v.z);
  scene.add(sphere);
  // Optionally add labels
});

edges.forEach(([i, j]) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z),
    new THREE.Vector3(vertices[j].x, vertices[j].y, vertices[j].z)
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xffffff}));
  scene.add(line);
});