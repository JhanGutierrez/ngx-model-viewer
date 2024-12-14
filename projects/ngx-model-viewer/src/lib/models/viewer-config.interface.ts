export interface Camera {
  cameraPosition: [number, number, number];
  fov: number;
}

export interface Controls {
  targetPosition: [number, number, number];
  enableControls: boolean;
  enableZoom: boolean;
}

export interface Rendering {
  backgroundColor?: string;
  environmentPath?: string;
  ambientColor: string | number;
  ambientIntensity: number;
}

export interface Lighting {
  position: [number, number, number];
  color: string | number;
  intensity: number;
  castShadow: boolean;
}

export interface Grid {
  size: number;
  divisions: number;
  color: string;
  enableGrid: boolean;
}

export interface Wireframe {
  color: string;
  enableWireframe: boolean;
}

export interface NgxModelViewerConfig {
  camera: Camera;
  controls: Controls;
  rendering: Rendering;
  lighting: Lighting;
  grid: Grid;
  wireframe: Wireframe;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export type OptionalNgxModelViewerConfig = {
  [K in keyof NgxModelViewerConfig]?: NgxModelViewerConfig[K] extends object
    ? Partial<NgxModelViewerConfig[K]>
    : NgxModelViewerConfig[K];
};

export interface NgxOnModelViewerLoad {
  modelPath: string;
  triangles: number;
}

export interface NgxOnModelViewerUpdate {
  cameraPosition: [number, number, number];
  targetPosition: [number, number, number];
}