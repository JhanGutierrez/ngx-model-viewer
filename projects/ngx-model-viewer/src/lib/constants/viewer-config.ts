import { NgxModelViewerConfig } from "../models/viewer-config.interface";

export const defaultConfig: NgxModelViewerConfig = {
  camera: {
    cameraPosition: [-6, 7, 4],
    fov: 50,
  },
  controls: {
    targetPosition: [0, 0, 0],
    enableControls: true,
    enableZoom: true
  },
  rendering: {
    ambientColor: 0xb1e1ff,
    ambientIntensity: 0.5,
  },
  lighting: {
    position: [100, 100, 100],
    color: 0xfff2e6,
    intensity: Math.PI,
    castShadow: true,
  },
  grid: {
    size: 10,
    divisions: 5,
    color: '#FFF',
    enableGrid: false
  },
  wireframe: {
    color: '#FFF',
    enableWireframe: false,
  },
  autoRotate: false,
  autoRotateSpeed: 0.1
};