import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  LoadingManager,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { ModelService } from './services/model.service';
import { EnvironmentService } from './services/environment.service';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CommonModule } from '@angular/common';
import { countTriangles } from './utils/triangles-counter';
import {
  NgxModelViewerConfig,
  NgxOnModelViewerLoad,
  NgxOnModelViewerUpdate,
  OptionalNgxModelViewerConfig,
} from './models/viewer-config.interface';
import { defaultConfig } from './constants/viewer-config';
import mergeWithDefaults from './utils/merge-with-defaults';

@Component({
  selector: 'ngx-model-viewer',
  standalone: true,
  imports: [CommonModule],
  providers: [ModelService, EnvironmentService],
  template: `<div
    #containerRef
    [ngStyle]="{ width: '100%', height: '100%' }"
  ></div>`,
})
export class NgxModelViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  constructor(
    private readonly _modelService: ModelService,
    private _environmentService: EnvironmentService
  ) {}

  initConfig = input<OptionalNgxModelViewerConfig>();
  onRendererUpdate = output<NgxOnModelViewerUpdate>();
  modelPath = input.required<string>();
  onModelLoad = output<NgxOnModelViewerLoad>();
  onLoadProgress = output<number>();

  private _containerRef = viewChild<ElementRef>('containerRef');
  private _renderer: WebGLRenderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  private _directionalLight: DirectionalLight = new DirectionalLight();
  private _loadingManager: LoadingManager = new LoadingManager();
  private _config!: NgxModelViewerConfig;
  private _gridHelper: GridHelper = new GridHelper();
  private _loader: GLTFLoader = new GLTFLoader();
  private _ambientLight = new AmbientLight();
  private _rotateGroup: Group = new Group();
  private _orbitControls!: OrbitControls;
  private _camera!: PerspectiveCamera;
  private _scene: Scene = new Scene();
  private _model: Object3D | null = null;
  private _clock: Clock = new Clock();
  private _interacting: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelPath'] && !changes['modelPath'].isFirstChange())
      this.loadModel();
  }

  public updatePosition(
    cameraPosition: [number, number, number],
    targetPosition: [number, number, number]
  ) {
    this._camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
    this._camera.updateProjectionMatrix();

    this._orbitControls.target.set(
      targetPosition[0],
      targetPosition[1],
      targetPosition[2]
    );
  }

  public toggleGrid(enable: boolean) {
    this._gridHelper.visible = enable;
  }

  public toggleRotation(enable: boolean) {
    this._config.autoRotate = enable;
  }

  public toggleWirerame(enable: boolean) {
    this._modelService.toggleWireframe(enable);
  }

  ngAfterViewInit(): void {
    this._config = mergeWithDefaults(defaultConfig, this.initConfig() ?? {});
    this._loader = new GLTFLoader(this._loadingManager);
    this.initScene();
    this.loadModel();

    this._rotateGroup.add(this._gridHelper);
    this._scene.add(
      this._rotateGroup,
      this._ambientLight,
      this._directionalLight
    );

    this.resize();
    this.tick();
  }

  private initScene() {
    this.initCamera();
    this.initControls();
    this.initRendering();
    this.initLighting();
    this.initGrid();
    this.setupLoadingManager();
  }

  private initCamera() {
    const { cameraPosition } = this._config.camera;
    const container = this._containerRef()?.nativeElement;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this._camera = new PerspectiveCamera(
      this._config.camera.fov,
      width / height,
      0.1,
      1000
    );
    container.appendChild(this._renderer.domElement);
    this._camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
    this._camera.updateProjectionMatrix();
  }

  private initControls() {
    const { controls } = this._config;
    this._orbitControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._orbitControls.enableRotate = controls.enableControls;
    this._orbitControls.enableZoom = controls.enableZoom;
    this._orbitControls.target.set(
      controls.targetPosition[0],
      controls.targetPosition[1],
      controls.targetPosition[2]
    );

    this._orbitControls.addEventListener(
      'start',
      () => (this._interacting = true)
    );
    this._orbitControls.addEventListener('end', () => {
      const { position } = this._camera;
      const { target } = this._orbitControls;

      this._interacting = false;
      this.onRendererUpdate.emit({
        cameraPosition: [
          parseFloat(position.x.toFixed(2)),
          parseFloat(position.y.toFixed(2)),
          parseFloat(position.z.toFixed(2)),
        ],
        targetPosition: [
          parseFloat(target.x.toFixed(2)),
          parseFloat(target.y.toFixed(2)),
          parseFloat(target.z.toFixed(2)),
        ],
      });
    });
  }

  private initRendering() {
    const { backgroundColor } = this._config.rendering;
    this._scene.background = backgroundColor
      ? new Color(backgroundColor)
      : null;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = PCFSoftShadowMap;
    this._renderer.toneMapping = ACESFilmicToneMapping;
    this.initEnvironment();
  }

  private initEnvironment() {
    const { environmentPath } = this._config.rendering;
    if (environmentPath)
      this._environmentService.loadEnvironment(
        environmentPath,
        this._scene,
        this._loadingManager
      );
  }

  private initLighting() {
    const { lighting, rendering } = this._config;
    const { ambientColor, ambientIntensity } = rendering;
    this._ambientLight.color.set(ambientColor);
    this._ambientLight.intensity = ambientIntensity;
    this._directionalLight.position.set(
      lighting.position[0],
      lighting.position[1],
      lighting.position[2]
    );
    this._directionalLight.color = new Color(lighting.color);
    this._directionalLight.intensity = lighting.intensity;
    this._directionalLight.castShadow = lighting.castShadow;
    this._directionalLight.shadow.mapSize.set(1024, 1024);
    this._directionalLight.shadow.bias = -0.0001;
  }

  private initGrid() {
    this._gridHelper = new GridHelper(
      this._config.grid.size,
      this._config.grid.divisions,
      this._config.grid.color,
      this._config.grid.color
    );
    this._gridHelper.material.transparent = true;
    this._gridHelper.visible = this._config.grid.enableGrid;
  }

  private loadModel() {
    if (!this.modelPath()) return;
    this._loader.load(
      this.modelPath(),
      (gltf) => {
        const { scene } = gltf;
        if (this._model) this._rotateGroup.remove(this._model);

        this._model = scene;
        this._modelService.loadModel(this._model, this._config.wireframe.color);

        const { enableWireframe } = this._config.wireframe;
        this._modelService.toggleWireframe(enableWireframe);

        this.onModelLoad.emit({
          triangles: countTriangles(this._model),
          modelPath: this.modelPath(),
        });

        this._rotateGroup.add(this._model);
      },
      undefined,
      (error) => console.error('Failed to load model:', error)
    );
  }

  private tick() {
    requestAnimationFrame(() => this.tick());
    this._orbitControls.update();
    const rotationSpeed =
      !this._config.autoRotate || this._interacting === true
        ? 0
        : this._config.autoRotateSpeed;

    this._rotateGroup.rotation.y += rotationSpeed * this._clock.getDelta();
    this._renderer.render(this._scene, this._camera);
  }

  private setupLoadingManager() {
    this._loadingManager.onProgress = (_, itemsLoaded, itemsTotal) => {
      this.onLoadProgress.emit(Math.round((itemsLoaded / itemsTotal) * 100));
    };

    this._loadingManager.onError = (url) => {
      console.error(`Failed to load the resource`, url);
    };
  }

  @HostListener('window:resize', ['$event'])
  private resize() {
    const container = this._containerRef()?.nativeElement;
    if (container && this._camera) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      this._renderer.setSize(width, height);
      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();
    }
  }

  ngOnDestroy(): void {
    this._environmentService.disposeEnvironment();
    if (this._model) this._modelService.disposeModel(this._model);
    this._gridHelper.dispose();
  }
}
