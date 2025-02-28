import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';

@Component({
  selector: 'app-photo-carousel',
  template: ` <canvas #canvas3D></canvas> `,
  styles: [
    `
      :host {
        display: block;
      }
      canvas {
        display: block;
      }
    `,
  ],
})
export class PhotoCarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas3D', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  // Groups and objects
  private group = new THREE.Group();
  private particles!: THREE.Points;
  private planeMeshes: THREE.Mesh[] = [];

  // For the “DNA” style arrangement
  private planeCount = 8; // Modify as needed
  private planeRadius = 400; // The distance from center
  private planeSpacingY = 150; // How far each plane is spaced on Y
  private angleOffset = 540; // The “yaw” in your old code (like 380/xmlList.length)...

  // Camera interpolation
  private goPosition = new THREE.Vector3(0, 0, 1000);
  private goTarget = new THREE.Vector3(0, 0, 0);

  // Raycaster
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Track hover states
  private hoveredObject: THREE.Object3D | null = null;

  // Track selected plane for manual enumeration
  private selectedPlaneIndex = 0;

  private animationId?: number;

  constructor() {}

  ngAfterViewInit(): void {
    this.initScene();
    this.createParticles();
    this.createPhotoPlanes(); // Our “DNA spiral” planes
    this.animate();
  }

  ngOnDestroy(): void {
    // Clean up the animation loop when the component is destroyed
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.set(0, 0, 1000);
    this.scene.add(this.camera);

    this.scene.add(this.group);
  }

  // 1) Create the star/particle field
  private createParticles(): void {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 4000;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 5,
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
  }

  // 2) Create the “DNA spiral” planes (replacing your VideoCube usage)
  private createPhotoPlanes(): void {
    const images = [
      'assets/flash_cs4_firefly.png',
      'assets/flash_cs4.png',
      'assets/lamp.jpeg',
      'assets/iis-7-welcome-screen.png',
      'assets/flash_cc.jpg',
      'assets/flash_cc.jpg',
      'assets/flash_cc.jpg',
      'assets/flash_cc.jpg',
    ];

    const textureLoader = new THREE.TextureLoader();

    images.forEach((img, i) => {
      const texture = textureLoader.load(img);
      // const material = new THREE.MeshBasicMaterial({
      //   map: texture,
      //   side: THREE.DoubleSide
      // });
      // const geometry = new THREE.PlaneGeometry(200, 200);
      // const planeMesh = new THREE.Mesh(geometry, material);
      // We’ll make a 10px thick “box” (width=200, height=200, depth=10)
      const geometry = new THREE.BoxGeometry(200, 200, 30);

      // OPTIONAL: If you only want the front/back to show the image and the sides a solid color,
      // create an array of materials (the order is [+x, -x, +y, -y, +z, -z]):
      const materials = [
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // +x
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // -x
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // +y
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // -y
        new THREE.MeshBasicMaterial({ map: texture }), // +z (front)
        new THREE.MeshBasicMaterial({ map: texture }), // -z (back)
      ];

      // If you want the same texture on all faces, you can still pass in [material, material, ...] for each side.
      const boxMesh = new THREE.Mesh(geometry, materials);

      // Mimic “plane.yaw((380/xmlList.length()) * i)” by placing them in a circle
      const angle = (this.angleOffset / this.planeCount) * i * (Math.PI / 180);
      boxMesh.position.x = Math.sin(angle) * this.planeRadius;
      boxMesh.position.z = Math.cos(angle) * this.planeRadius;
      boxMesh.position.y = i * this.planeSpacingY;

      // Let’s have them face inward toward the camera:
      boxMesh.lookAt(new THREE.Vector3(0, boxMesh.position.y, 0));

      this.planeMeshes.push(boxMesh);
      this.group.add(boxMesh);
    });
  }

  // 3) Hover and click behavior via pointer events (raycasting)
  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // Raycast
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planeMeshes);
    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (this.hoveredObject !== intersected) {
        // We just “entered” a new plane
        this.onPlaneOver(intersected);
      }
    } else {
      // We are not over any plane
      if (this.hoveredObject) {
        this.onPlaneOut(this.hoveredObject);
      }
    }
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planeMeshes);
    if (intersects.length > 0) {
      // Only consider the closest
      const intersected = intersects[0].object;
      this.onPlaneClick(intersected);
    }
  }

  private onPlaneOver(object: THREE.Object3D) {
    // If something else was hovered, trigger out on that
    if (this.hoveredObject && this.hoveredObject !== object) {
      this.onPlaneOut(this.hoveredObject);
    }
    this.hoveredObject = object;
    // Example: scale up a bit or change color
    object.scale.set(1.1, 1.1, 1.1);
  }

  private onPlaneOut(object: THREE.Object3D) {
    // Reset scale
    object.scale.set(1, 1, 1);
    if (this.hoveredObject === object) {
      this.hoveredObject = null;
    }
  }

  private onPlaneClick(object: THREE.Object3D) {
    // Find which plane index was clicked
    const index = this.planeMeshes.indexOf(object as THREE.Mesh);
    if (index !== -1) {
      this.selectedPlaneIndex = index;
      this.focusOnPlane(this.selectedPlaneIndex);
    }
  }

  // 4) Keyboard navigation: left/right to cycle planes
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      // Move to the previous plane
      this.selectedPlaneIndex--;
      if (this.selectedPlaneIndex < 0) {
        this.selectedPlaneIndex = this.planeMeshes.length - 1;
      }
      this.focusOnPlane(this.selectedPlaneIndex);
    } else if (event.key === 'ArrowRight') {
      // Move to the next plane
      this.selectedPlaneIndex++;
      if (this.selectedPlaneIndex >= this.planeMeshes.length) {
        this.selectedPlaneIndex = 0;
      }
      this.focusOnPlane(this.selectedPlaneIndex);
    }
  }

  // Positions the camera in front of the selected plane
  // private focusOnPlane(idx: number) {
  //   const planeObj = this.planeMeshes[idx];
  //   // Get the plane's world position (in case the plane is inside a group)
  //   const planePos = new THREE.Vector3();
  //   planeObj.getWorldPosition(planePos);

  //   // moveBackward(300) => we move “out” from the plane
  //   const dir = planePos.clone().normalize().multiplyScalar(300);
  //   // final camera position is planePos + dir
  //   const finalCamPos = planePos.clone().add(dir);

  //   this.goPosition.copy(finalCamPos);
  //   this.goTarget.copy(planePos);
  // }
  private focusOnPlane(idx: number) {
    const planeObj = this.planeMeshes[idx];

    // Get the plane's world position
    const planePos = new THREE.Vector3();
    planeObj.getWorldPosition(planePos);

    // Get the plane's local forward direction in world space
    // (Three.js typically uses the negative Z axis as "forward")
    const planeDir = new THREE.Vector3();
    planeObj.getWorldDirection(planeDir);

    // Move camera some distance *behind* the plane's forward vector
    // If you need to reverse direction, switch to .multiplyScalar(+300)
    // to get the camera on the front side.
    const distance = 300;
    const finalCamPos = planePos
      .clone()
      .add(planeDir.multiplyScalar(-distance));

    this.goPosition.copy(finalCamPos);
    this.goTarget.copy(planePos);
  }

  // 5) Animate: update camera and objects each frame
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Smooth camera transitions
    this.camera.position.x -= (this.camera.position.x - this.goPosition.x) / 15;
    this.camera.position.y -= (this.camera.position.y - this.goPosition.y) / 15;
    this.camera.position.z -= (this.camera.position.z - this.goPosition.z) / 15;

    // Smooth target transition
    const lookX =
      this.camera.position.x - (this.camera.position.x - this.goTarget.x) / 6;
    const lookY =
      this.camera.position.y - (this.camera.position.y - this.goTarget.y) / 6;
    const lookZ =
      this.camera.position.z - (this.camera.position.z - this.goTarget.z) / 6;
    this.camera.lookAt(lookX, lookY, lookZ);

    // If you want the entire group to spin slowly (like your original rotate),
    // do something like:
    // this.group.rotation.y += 0.003;

    this.renderer.render(this.scene, this.camera);
  };

  // Handle browser resizing
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PhotoCarouselComponent],
  template: `
    <router-outlet></router-outlet>
    <app-photo-carousel></app-photo-carousel>
  `,
})
export class AppComponent {
  title = 'ngx-threejs-carousel-demo';
}
