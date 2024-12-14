import { NgxModelViewerConfig, OptionalNgxModelViewerConfig } from "../models/viewer-config.interface";


function mergeWithDefaults(
  defaults: NgxModelViewerConfig,
  overrides?: OptionalNgxModelViewerConfig
): NgxModelViewerConfig {
  return {
    ...defaults,
    ...overrides,
    camera: {
      ...defaults.camera,
      ...overrides?.camera,
    },
    controls: {
      ...defaults.controls,
      ...overrides?.controls,
    },
    rendering: {
      ...defaults.rendering,
      ...overrides?.rendering,
    },
    lighting: {
      ...defaults.lighting,
      ...overrides?.lighting,
    },
    grid: {
      ...defaults.grid,
      ...overrides?.grid,
    },
    wireframe: {
      ...defaults.wireframe,
      ...overrides?.wireframe,
    },
  };
}

export default mergeWithDefaults;