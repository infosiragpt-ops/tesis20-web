import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { cinemaFitDistance } from '../../src/nido/cuentos/three/cinema-framing.js';

test('cinema keeps both pages inside a safe frame across tablet/desktop ratios and orbit directions', () => {
  const points = [];
  for (const x of [-.6, .6]) for (const y of [0, .62]) for (const z of [-.3, .5]) points.push(new THREE.Vector3(x, y, z));
  for (const aspect of [.85, 1.1, 1.33, 1.78, 2.4]) for (const yaw of [-.7, 0, .7]) for (const elevation of [.35, .65, 1]) {
    const direction = new THREE.Vector3(Math.sin(yaw), elevation, Math.cos(yaw)).normalize();
    const focus = new THREE.Vector3(.09, .34, .08);
    const distance = cinemaFitDistance(points, focus, direction, 42, aspect);
    const camera = new THREE.PerspectiveCamera(42, aspect, .01, 100);
    camera.position.copy(focus).addScaledVector(direction, distance);
    camera.lookAt(focus); camera.updateMatrixWorld();
    for (const point of points) {
      const projected = point.clone().project(camera);
      assert.ok(Math.abs(projected.x) <= .90001, `horizontal crop at aspect ${aspect}`);
      assert.ok(Math.abs(projected.y) <= .76001, `vertical crop at aspect ${aspect}`);
      assert.ok(projected.z < 1 && projected.z > -1);
    }
  }
});
