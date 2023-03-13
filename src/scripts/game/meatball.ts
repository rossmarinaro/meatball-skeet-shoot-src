import * as ENABLE3D from '@enable3d/phaser-extension';

import { Actor } from './Actor';

//--------- MEATBALL


export class Meatball extends Actor {

  
  public static meatballs: Meatball[] = []

  constructor(scene: ENABLE3D.Scene3D, x: number, y: number, z: number)
  {

    super(scene, 'meatball_3d', x, y, z, true, true, ()=> this.scene.third.physics.add.existing(this, { shape: 'sphere', mass: 0.5, collisionFlags: 2, radius: 7, /*breakable: true, fractureImpulse: 5*/}));

    //tween

    let tmp = this.position.clone();

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
      this.position.setY(tmp.y);
      if (this.body !== null && this.body !== undefined)
        this.body.needUpdate = true; 
    }});

  }

//------------------------- spawn

  public static spawn(scene: ENABLE3D.Scene3D, spawns: number): void
  {

      for (let i = 0; i < spawns; i++)
      {

        let x = Phaser.Math.Between(-100, 100),
            y = Phaser.Math.Between(30, 70),
            z = Phaser.Math.Between(-200, -220);

        Meatball.meatballs.push(new Meatball(scene, x, y, z)); 

      }

  }
}