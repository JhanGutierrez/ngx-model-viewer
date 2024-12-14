import { Mesh, Object3D } from 'three';

export const countTriangles = (model: Object3D) => {
  let triangles = 0;
  model.traverse((child) => {
    if (child instanceof Mesh && child.geometry) {
      const geometry = child.geometry;
      geometry.computeVertexNormals();
      triangles += geometry.index
        ? geometry.index.count / 3
        : geometry.attributes.position.count / 3;
    }
  });
  return triangles;
};