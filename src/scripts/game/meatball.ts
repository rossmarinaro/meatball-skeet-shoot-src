import * as ENABLE3D from '@enable3d/phaser-extension'
import { AudioManager } from '../internals/Audio'
import { Actor } from './Actor'
import { Particles3D } from './particles3d'

//--------- MEATBALL


export class Meatball extends Actor {

  public health: number = 1
  private active: boolean = true

  constructor(scene: ENABLE3D.Scene3D, x: number, y: number, z: number)
  {
    super(scene, 'meatball_3d', x, y, z, true, true, () => {

        this.position.x = x;
        this.position.z = z;
        //@ts-ignore
        this.scene.third.physics.add.existing(this, { shape: 'sphere', mass: 0.5, collisionFlags: 6, radius: 7 });
    });

    //tween

    const tmpPosition = this.position.clone();

    scene.tweens.add({
      targets: tmpPosition, 
      duration: 5000, 
      stagger: scene.tweens.stagger(100, {}),
      repeatDelay: Math.random() * 100, 
      delay: Math.random() * 100, 
      ease: 'Sine.easeInOut',  
      y: tmpPosition.y + Math.random() * 100, 
      repeat: -1, 
      yoyo: true,
      onUpdate: () => {

      this.position.setY(tmpPosition.y);
      
      if (this.body !== null && this.body !== undefined)
        this.body.needUpdate = true; 
    }});

  }

  //-----------------------------------

  public onDestroy(): void
  {
    if (!this.active)
      return;

    this.active = false;

    this.scene['incrementScore'](1);

    AudioManager.play('fire_fx', 3, false, this.scene, 0);

      this.traverse((child: ENABLE3D.THREE.Object3D) => {  
        if (child.name === 'body')
          child.visible = false; 
      });

      this.obj.animations.forEach((clip: ENABLE3D.THREE.AnimationClip) => {

        if (clip.name === 'explode')
        {
          this.anims.mixer.clipAction(clip).reset().play();

          this.scene.time.delayedCall(500, () => {
            
            if (this.hasBody) 
            {
                const particles = new Particles3D(this.scene, 0xff0000, 50, this.position.x, this.position.y, this.position.z, 1, 4, { x: Phaser.Math.Between(5, 10), y: Phaser.Math.Between(5, 10), z: Phaser.Math.Between(5, 10) });
                
                this.scene.events.on('update', () => {
                    if (this.scene.scene.settings.active && particles.particles) {
                        particles.particles.scale.set(Phaser.Math.Between(3, 6), Phaser.Math.Between(3, 6), Phaser.Math.Between(3, 6));
                        particles.particles.rotation.set(Phaser.Math.Between(3, 6), Phaser.Math.Between(3, 6), Phaser.Math.Between(3, 6));
                    }
                });
                
                this.scene.time.delayedCall(600, () => {
                    particles.particles.geometry.dispose();
                    this.scene.third.scene.remove(particles.particles);
                });
          
                //@ts-ignore
                this.scene.third.destroy(this);
            }

          });
        }
      });
  }

}