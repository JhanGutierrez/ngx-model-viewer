import { Injectable } from '@angular/core';
import {
  EquirectangularReflectionMapping,
  LoadingManager,
  Scene,
  Texture,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

@Injectable()
export class EnvironmentService {
  private _previousEnvironment: Texture | null = null;

  constructor() {}

  loadEnvironment(path: string, scene: Scene, loadingManager: LoadingManager): void {
    this.disposeEnvironment();
    new RGBELoader(loadingManager).load(
      path,
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.environment = texture;
        this._previousEnvironment = texture;
      },
      undefined,
      (error) => {
        console.error(`Failed to load the environment texture from: ${path}`, error);
      }
    );
  }

  disposeEnvironment(): void {
    if (this._previousEnvironment) {
      this._previousEnvironment.dispose();
      this._previousEnvironment = null;
    }
  }
}