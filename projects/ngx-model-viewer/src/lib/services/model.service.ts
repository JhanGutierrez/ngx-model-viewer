import { Injectable } from '@angular/core';
import {
  Box3,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Object3D,
  Vector3,
  WireframeGeometry,
} from 'three';

@Injectable()
export class ModelService {
  private _lineSegments: LineSegments[] = [];
  loadModel(model: Object3D, wireFrameColor: string) {
    this.disposeModel(model);

    this.setScale(model);
    this.center(model);

    model.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const edges = new WireframeGeometry(child.geometry);
        const lineMaterial = new LineBasicMaterial({
          color: wireFrameColor,
        });
        const wireframe = new LineSegments(edges, lineMaterial);

        wireframe.visible = false;
        this._lineSegments.push(wireframe);
        child.add(wireframe);
      }
    });
  }

  private setScale(model: Object3D) {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3()).length();
    const scale = 5 / size;
    model.scale.set(scale, scale, scale);
  }

  private center(model: Object3D) {
    const boxAdjusted = new Box3().setFromObject(model);
    const center = new Vector3();
    boxAdjusted.getCenter(center);
    model.position.set(-center.x, -boxAdjusted.min.y, -center.z);
  }

  public toggleWireframe(showWireframe: boolean) {
    this._lineSegments.forEach(
      (wireframe) => (wireframe.visible = showWireframe)
    );
  }

  public disposeModel(model: Object3D) {
    model.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          Array.isArray(child.material)
            ? child.material.forEach((material) => material.dispose())
            : child.material.dispose();
        }
      }
    });

    this.disposeWireframe();
  }

  private disposeWireframe() {
    if (this._lineSegments.length === 0) return;
    this._lineSegments.forEach((wireframe) => {
      if (wireframe) {
        wireframe.geometry.dispose();
        (wireframe.material as LineBasicMaterial).dispose();
        wireframe.removeFromParent();
      }
    });
  }
}
