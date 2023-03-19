import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { Actor } from './Actor';

//--------- MEATBALL


export class Meatball extends Actor {


  constructor(scene: ENABLE3D.Scene3D, x: number, y: number, z: number)
  {

    super(scene, 'meatball_3d', x, y, z, true, true, ()=> {

      this.scene.third.physics.add.existing(this, { 
        shape: 'sphere', 
        mass: 0.5, 
        collisionFlags: 6, 
        radius: 7
      });

      this.body.on.collision(async (otherObject, event) => {

        if(otherObject.userData['damage'])
        {
    
          this.scene['score']++;
          this.scene.third.destroy(otherObject);
          System.Process.app.audio.play('fire_fx', 6, false, this.scene, 0);
    
            this.traverse((i: any) => {  
              if (i.name === 'body')
                i.visible = false;
            });
    
            this.obj.animations.forEach((clip: ENABLE3D.THREE.AnimationClip) => {
    
              if (clip.name === 'explode')
              {
    
                this.anims.mixer.clipAction(clip).reset().play();
    
                this.scene.time.delayedCall(500, () => {
                  if (this.hasBody)
                    this.scene.third.destroy(this);
                });
              }
            });
          }
        });
    });

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


}