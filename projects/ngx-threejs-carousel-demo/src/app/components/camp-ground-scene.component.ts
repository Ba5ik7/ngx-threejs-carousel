import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
  output,
  Input,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'camp-ground-scene',
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
export class CampGroundSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas3D', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input('currentProject') set currentProject(value: number) {
    requestAnimationFrame(() => this.focusOnPlane(value));
    this.currentProjectSignal.set(value);
  }
  currentProjectSignal = signal<number>(0);
  projectIndexChanged = output<number>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  // Groups and objects
  private group = new THREE.Group();
  private particles!: THREE.Points;
  private planeMeshes: THREE.Mesh[] = [];

  // For the “DNA” style arrangement
  private planeRadius = 375; // The distance from center
  private planeSpacingY = 150; // How far each plane is spaced on Y
  private angleOffset = 540; // The “yaw” in your old code (like 380/xmlList.length)...
  private images = [
    'assets/javascript.png',
    'assets/typescript.png',
    'assets/flash.png',
    'assets/gba.png',
    'assets/ngx-workshop.png',
    'assets/mountain-2.png',
    'assets/flash_cs4_firefly.png',
    'assets/flash_cs4.png',
    'assets/flash_cc.jpg',
    'assets/iis-7-welcome-screen.png',
    'assets/lamp.jpeg',
  ];

  // Camera interpolation
  private goPosition = new THREE.Vector3(0, 0, 1000);
  private goTarget = new THREE.Vector3(0, 0, 0);

  // Raycaster
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Track hover states
  private hoveredObject: THREE.Object3D | null = null;

  private animationId?: number;

  constructor() {}

  ngAfterViewInit(): void {
    this.initScene();
    this.createParticles();
    this.createPhotoPlanes();
    this.addLights();
    this.load3DModel();
    this.addSkySphere();
    this.animate();

    this.focusOnPlane(0);
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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      8000
    );
    this.camera.position.set(3000, 3000, 3000);
    this.scene.add(this.camera);

    this.scene.add(this.group);
  }

  private createParticles(): void {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 3000;
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

    this.particles.position.y = 2000;
    this.scene.add(this.particles);
  }

  private createPhotoPlanes(): void {
    const textureLoader = new THREE.TextureLoader();

    this.images.forEach((img, i) => {
      const texture = textureLoader.load(img);
      const geometry = new THREE.BoxGeometry(260, 146, 30);

      // OPTIONAL: If you only want the front/back to show the image and the sides a solid color,
      // create an array of materials (the order is [+x, -x, +y, -y, +z, -z]):
      // Instead of MeshBasicMaterial({ color: 0x555555 }) etc.
      const materials = [
        new THREE.MeshLambertMaterial({ color: 0x555555 }), // +x
        new THREE.MeshLambertMaterial({ color: 0x555555 }), // -x
        new THREE.MeshLambertMaterial({ color: 0x555555 }), // +y
        new THREE.MeshLambertMaterial({ color: 0x555555 }), // -y
        // For front and back faces with a texture:
        new THREE.MeshLambertMaterial({ color: 0x555555 }), // +z (front)
        new THREE.MeshBasicMaterial({ map: texture }), // -z (back)
      ];

      // If you want the same texture on all faces, you can still pass in [material, material, ...] for each side.
      const boxMesh = new THREE.Mesh(geometry, materials);
      const angle =
        (this.angleOffset / this.images.length) * i * (Math.PI / 180);
      boxMesh.position.x = Math.sin(angle) * this.planeRadius;
      boxMesh.position.z = Math.cos(angle) * this.planeRadius;
      boxMesh.position.y = i * this.planeSpacingY;

      // Let’s have them face inward toward the camera:
      boxMesh.lookAt(new THREE.Vector3(0, boxMesh.position.y, 0));

      this.planeMeshes.push(boxMesh);
      this.group.add(boxMesh);
    });

    this.group.position.y = 175;
    this.group.position.x = -133;
    this.group.position.z = -280;
    this.group.rotateY(89.7);
  }

  private load3DModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/forest_island_camp_gltf/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(0.2, 0.2, 0.2);
        this.scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF model:', error);
      }
    );
  }

  private addLights(): void {
    // Warm hemisphere light: sky color is orange-ish, ground color is a darker brown
    const hemiLight = new THREE.HemisphereLight(0xffc37d, 0x442222, 0.3);
    this.scene.add(hemiLight);

    // A warm ambient light (e.g. a soft orange hue)
    const ambientLight = new THREE.AmbientLight(0x72015f, 3);
    // ambientLight.castShadow = true;
    this.scene.add(ambientLight);

    // A directional light that simulates a low, golden sun
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    // dirLight.castShadow = true;
    dirLight.position.set(200, 100, 200);
    this.scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x72015f, 3);
    // dirLight2.castShadow = true;
    dirLight2.position.set(300, 200, -200);
    this.scene.add(dirLight2);
  }

  private addSkySphere() {
    const skyGeo = new THREE.SphereGeometry(3500, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0000ff) }, // Blue
        bottomColor: { value: new THREE.Color(0xffffff) }, // White
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y * 0.5 + 0.5;
          // "h" goes from 0 to 1 as we move from bottom to top
          gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
        }
      `,
      side: THREE.BackSide,
    });

    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  }

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
      this.currentProjectSignal.set(index);
      this.focusOnPlane(this.currentProjectSignal());
      this.projectIndexChanged.emit(index);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      // Move to the previous plane
      this.currentProjectSignal.update((value) => value - 1);
      if (this.currentProjectSignal() < 0) {
        this.currentProjectSignal.set(this.planeMeshes.length - 1);
      }
      this.focusOnPlane(this.currentProjectSignal());
      this.projectIndexChanged.emit(this.currentProjectSignal());
    } else if (event.key === 'ArrowRight') {
      // Move to the next plane
      this.currentProjectSignal.update((value) => value + 1);
      if (this.currentProjectSignal() >= this.planeMeshes.length) {
        this.currentProjectSignal.set(0);
      }
      this.focusOnPlane(this.currentProjectSignal());
      this.projectIndexChanged.emit(this.currentProjectSignal());
    }
  }

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
    const distance = 200;
    const finalCamPos = planePos
      .clone()
      .add(planeDir.multiplyScalar(-distance));

    this.goPosition.copy(finalCamPos);
    this.goTarget.set(planePos.x, planePos.y, planePos.z);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Smooth camera transitions
    this.camera.position.x -= (this.camera.position.x - this.goPosition.x) / 32;
    this.camera.position.y -= (this.camera.position.y - this.goPosition.y) / 32;
    this.camera.position.z -= (this.camera.position.z - this.goPosition.z) / 32;

    // Smooth target transition
    const lookX =
      this.camera.position.x - (this.camera.position.x - this.goTarget.x) / 32;
    const lookY =
      this.camera.position.y - (this.camera.position.y - this.goTarget.y) / 32;
    const lookZ =
      this.camera.position.z - (this.camera.position.z - this.goTarget.z) / 32;
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
