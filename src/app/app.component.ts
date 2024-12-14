import { Component, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxModelViewerComponent } from '../../projects/ngx-model-viewer/src/lib/ngx-model-viewer.component';
import { OptionalNgxModelViewerConfig } from '../../projects/ngx-model-viewer/src/lib/models/viewer-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule,  NgxModelViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ngx-viewer-lib';


  gltfViewer = viewChild<NgxModelViewerComponent>('gltfViewer');
  public showGrid = signal<boolean>(false);
  public showWireframe = signal<boolean>(false);
  public autoRotate = signal<boolean>(false);
  
  public config: OptionalNgxModelViewerConfig = {
    controls:{
      enableZoom: true,
      enableControls: true
    }
  };
 
  toggleGrid() {
    this.showGrid.set(!this.showGrid());
    this.gltfViewer()?.toggleGrid(this.showGrid());
  }

  toggleAutoRotate() {
    this.autoRotate.set(!this.autoRotate());
    this.gltfViewer()?.toggleRotation(this.autoRotate());
  }

  toggleWireframe() {
    this.showWireframe.set(!this.showWireframe());
    this.gltfViewer()?.toggleWirerame(this.showWireframe());
  }

}
