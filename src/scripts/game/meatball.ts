import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { Actor } from './Actor';
import { SkeetShoot } from './main';

//--------- MEATBALL


export class Meatball extends Actor {

  public health: number = 1
  private active: boolean = true

  constructor(scene: ENABLE3D.Scene3D, x: number, y: number, z: number)
  {

    super(scene, 'meatball_3d', x, y, z, true, true, () => {

        this.position.x = x;
        this.position.z = z;

        this.scene.third.physics.add.existing(this, { 
            shape: 'sphere', 
            mass: 0.5, 
            collisionFlags: 6, 
            radius: 7
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
    onUpdate: () => {
      this.position.setY(tmp.y);
      if (this.body !== null && this.body !== undefined)
        this.body.needUpdate = true; 
    }});

  }

  public onDestroy(): void
  {
    if (!this.active)
      return;

    this.active = false;

    SkeetShoot.incrementScore();
    
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
            {
  
              new System.Process.app.ThirdDimension.Particles3D(this.scene, {
                vert: 'vert3DVary', 
                frag: 'particle3D', 
                props: { 
                  depthTest: true, 
                  depthWrite: false, 
                  vertexColors: true, 
                  uniforms: {
                    alpha: { value: 1.0 },
                    colour: { value: new ENABLE3D.THREE.Vector4(255, 0.0, 0.0, 1.0) },
                    vUv: { value: new ENABLE3D.THREE.Vector3 }
                  }
                }
              },
                Phaser.Math.Between(-8, 8),
                50, 
                600,
                this.position.x, 
                this.position.y, 
                this.position.z,
                50,
                -5
              );
          
              this.scene.third.destroy(this);
            }

          });
        }
      });
  }

}