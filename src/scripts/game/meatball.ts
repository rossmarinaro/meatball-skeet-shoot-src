import * as ENABLE3D from '@enable3d/phaser-extension';

import { Actor } from './Actor';

//---------------------------------------------------------------- MEATBALL


export class Meatball extends Actor {

    public scene: ENABLE3D.Scene3D
    private x: number
    private y: number
    private z: number

    constructor(scene: ENABLE3D.Scene3D, x: number, y: number, z: number)
    {

      super(scene, 'meatball_3d', true, true, ()=> {

        this.position.set(this.x, this.y, this.z);
        this.scene.third.physics.add.existing(this, {
          shape: 'sphere',
          mass: 0.5,
          collisionFlags: 2,
          radius: 7,
          //breakable: true,
          // fractureImpulse: 5
        });

      });

      this.scene = scene;
      this.x = x;
      this.y = y;
      this.z = z;

    }

  //------------------------- spawn

    public static async spawn(scene: ENABLE3D.Scene3D, array: Meatball[]): Promise<Meatball[]>
    {
      for (let i = 0; i < 10; i++)
      {
        let x = Phaser.Math.Between(-100, 100),
            y = Phaser.Math.Between(30, 70),
            z = Phaser.Math.Between(-200, -220);
          array.push(new Meatball(scene, x, y, z));
      }

      //tweens

       array.forEach((i: ENABLE3D.ExtendedObject3D) => {
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