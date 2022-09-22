import { THREE, ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class Level extends ExtendedObject3D {

  public scene: Scene3D
  private bkgndMountains: ExtendedObject3D

    constructor(scene: Scene3D)
    {
      super();
      this.scene = scene;
      this.name = 'room';
    
    }
    public async load()
    {
      await this.scene.third.load.gltf('room').then(async (gltf: GLTF) => await this._init(gltf));
    }
    private async _init(gltf: GLTF)
    {
      
      for (let i in gltf.scene.children)
        this.add(gltf.scene);
  
      this.scene.third.add.existing(this);
  
      //background mountains
      this.scene.third.load.gltf('meatball_mountains').then(gltf => {
        this.bkgndMountains = new ExtendedObject3D();
        this.bkgndMountains.name = 'meatball_mountains';
        this.bkgndMountains.add(gltf.scene);
        this.scene.third.add.existing(this.bkgndMountains);
      });

      //invisible barrier
  
      // const barrier: any = new THREE.Mesh(new THREE.BoxGeometry(180, 50, 5), new THREE.MeshLambertMaterial({color: 0xff0000}));
      // barrier.position.set(0, -20, -75);
      // barrier.visible = false;
      // barrier.shape = 'box';
      // barrier.name = 'barrier';
      // this.scene.third.add.existing(barrier);
      // this.scene.third.physics.add.existing(barrier); 
      // barrier.body.setCollisionFlags(2)
  
      //sky box

      const loader = new THREE.CubeTextureLoader(),
      texture = loader.load([
          'assets/backgrounds/pixel.png',
          'assets/backgrounds/pixel.png',
          'assets/backgrounds/pixel.png',
          'assets/backgrounds/pixel.png',
          'assets/backgrounds/pixel.png',
          'assets/backgrounds/pixel.png'
      ]);
      this.scene.third.heightMap.scene.background = texture;
  
      this.traverse((child: any) => {
        if (child.isMesh)
        {
          this.scene.third.physics.add.existing(child, {
            shape: 'convex',
            mass: 0,
            collisionFlags: 1,
            autoCenter: false
          });
          child.castShadow = child.receiveShadow = true;
          if (child.material)
          {
               child.material.metalness = 0.4;
               child.material.shininess = 50;
              // child.material.reflectivity = 2
          }
        }
   
      });
    }
    getMesh()
    {
      for (let i in this.children[0])
        for (let element in this.children[0][i].children)
          for (let child in this.children[0][i].children[element].children)
            return this.children[0][i].children[element].children[child];
    }
  }