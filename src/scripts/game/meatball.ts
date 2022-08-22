

import { ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

//---------------------------------------------------------------- MEATBALL


export class Meatball extends ExtendedObject3D {

    public scene: Scene3D
    private x: number
    private y: number
    private z: number

    constructor(scene: Scene3D, x: number, y: number, z: number)
    {
      super();
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.z = z;
      this.name = 'meatball';
      this.scene.third.load.gltf('meatball_3d').then((gltf: GLTF) => this._init(gltf));    
    }
  
    private _init(gltf: GLTF): void
    {
      this.add(gltf.scene.children[0]);
      this.position.set(this.x, this.y, this.z);
      this.scene.third.add.existing(this);
      this.scene.third.physics.add.existing(this, {
        shape: 'sphere',
        mass: 0.5,
        collisionFlags: 2,
        radius: 7,
        //breakable: true,
        // fractureImpulse: 5
      });


      //this.body.setGravity(0.9, 0.9, 0.9);
  
/*       const applyForce = () => {
          let x = Phaser.Math.Between(-10, 10),
              y = Phaser.Math.Between(-10, 10),
              z = Phaser.Math.Between(-10, 10);
          this.body.applyForce(x, y, z)//.setAngularVelocity(x, y, z);
      }
      applyForce();
   */
      // this.body.on.collision(() => {
      //   if (this.scene.level.getMesh() !== undefined)
      //     applyForce();
      // });
  
      this.traverse((child: any) => {
        if (child.isMesh)
        {
          child.castShadow = child.receiveShadow = true;
          if (child.material)
            child.material.shininess = 50;
        }
      });
    }

    //------------------------- spawn

    public static async spawn(scene: Scene3D, array: Meatball[]): Promise<Meatball[]>
    {
      for (let i = 0; i < 10; i++)
      {
        let x = Phaser.Math.Between(-100, 100),
            y = Phaser.Math.Between(30, 70),
            z = Phaser.Math.Between(-200, -220);
          array.push(new Meatball(scene, x, y, z));
      }

      //tweens

       array.forEach((i: ExtendedObject3D) => {
        let tmp = i.position.clone();
         scene.tweens.add({
           targets: tmp, 
           duration: 5000, 
           stagger: scene.tweens.stagger(100, {}),
           repeatDelay: Math.random() * 100, 
           delay: Math.random() * 100, 
           ease: 'Sine.easeInOut', 
           y: tmp.y + Math.random() * 100, 
           repeat: -1, 
           yoyo: true,
         onUpdate: ()=> {
           i.position.setY(tmp.y);
           if (i.body !== null && i.body !== undefined)
             i.body.needUpdate = true; 
         }});
      });

      return array;

    }
  }