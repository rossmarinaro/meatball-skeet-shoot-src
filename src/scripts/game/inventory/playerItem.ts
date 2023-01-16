import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../../internals/Config';

import { Bullet } from '../Bullet';

//-------------------------------- player item base class (first person view holding weapon or item)

export class PlayerItem extends ENABLE3D.ExtendedObject3D {

  private obj: typeof System.Process.utils.GLTF
  private flipY: boolean | undefined
  private canAttack: boolean = true

  public scene: ENABLE3D.Scene3D
  public bullet: typeof Bullet = Bullet
  public player: typeof System.Process.app.ThirdDimension.Player3D | null
  public source: string
  public controls: any

  constructor(scene: ENABLE3D.Scene3D, name: string, flipY?: boolean) 
  {

    super();

    this.scene = scene;
    this.name = name;
    this.flipY = flipY;
    this.player = this.scene['player'] ? this.scene['player'] : null;
    this.source = this.player.data ? this.player.data.username : null;

    this.init(this.player.data ? this.player.data.skin : 'red');

  }


  //-------------------------------------------

  private async init(color: string): Promise<void> 
  {

    this.controls = this.scene['controller'].perspectiveControls;

    const gloveColor = await this.player.getGloveColor(color);

    this.scene['third'].load.gltf(this.name).then((glb: typeof System.Process.utils.GLTF) => {

      this.add(glb.scene);

      for (let i in glb.animations)
        this.anims.add(glb.animations[i].name, glb.animations[i]);

      this.scene['third'].animationMixers.add(this.anims.mixer);

      this.obj = glb;

      this.traverse((child: any) => {

        if (this.name === 'penne_pistol')
          child.position.z -= 0.15;

        if (child.name === 'glove')
          this.scene['third'].load.texture(`glove_${gloveColor}`).then(texture => {
            child.material.map = texture;
            child.material.map.flipY = this.flipY;
            this.scene['third'].add.existing(this);
          });

        if (child.name === 'muzzle') 
        {
          //console.log(child)//child.material.map = new Shaders
          child.opacity = 0.3;
          child.visible = false;
        }

        if (child.isMesh) 
        {
          child.castShadow = child.receiveShadow = true;
          if (child.material) 
          {
            child.material.metalness = 0.3;
            child.material.roughness = 0.3;
          }
        }

      });
    });
  }


  //------------------------ get current position of weapon box


  public async getCurrentPosition(): Promise<{ x: number, y: number, z: number }> 
  {

    const direction = this.scene['third'].camera.getWorldDirection(this.player.raycaster.ray.direction);

    return {
      x: direction.x,
      y: System.Config.isPortrait(this.scene) || System.Config.isDesktop(this.scene) ? direction.y : direction.y + 0.125,
      z: direction.z
    }
  }



  //---------------------------------------------------- fire weapon

  public async fire(): Promise<void> 
  {

    switch (this.name) 
    {

      case 'rolling_pin1':

        if (!this.canAttack)
          return;

        this.canAttack = false;

        this.anims.play('attack');

        this.scene.time.delayedCall(800, () => {

          System.Process.app.audio.play('sword_swipe', 0.5, false, this.scene, 0);

          if (!this.player.raycaster)
            return;


          const firePos = {
            x: this.player.position.x,
            y: this.player.position.y,
            z: this.player.position.z
          }

          if (firePos) {
            let hitPoint = this.scene.third.physics.add.sphere(
              {
                radius: 3,
                mass: 1,
                x: firePos.x,
                y: firePos.y,
                z: firePos.z
              },
              {
                phong: { color: 0xccc, visible: false }
              });

            hitPoint.rotation.copy(this.scene['controller'].perspectiveControls.current.target.rotation);
            hitPoint.body.setCcdMotionThreshold(1);
            hitPoint.body.setCcdSweptSphereRadius(0.2);

            //System.Process.app.events.socketEmit('DEATHMATCH: player attack', { source: this.source, damage: 0.1});

            hitPoint.body.on.collision(async otherObject => {

              if (await this.bullet.checkAttackSource(this.player, otherObject)) 
              {
                System.Process.app.events.socketEmit('DEATHMATCH: player damage', { attacker: this.source, user: otherObject['playerID'], damage: 1 });
                //this.destroyHitPoint(hitPoint);
              }
            });

            this.scene.time.delayedCall(400, () => this.destroyHitPoint(hitPoint));
          }

        });

        break;

      case 'penne_pistol':

        if (!this.canAttack)
          return;

        this.canAttack = false;

        this.scene.time.delayedCall(400, () => {

          this.anims.mixer.stopAllAction();
          this.canAttack = true;
        });

        if (System.Process.app.ThirdDimension.Inventory3D.ammo.penne_pistol <= 0)
        {
          System.Process.app.audio.play('sword_swipe', 0.5, false, this.scene, 0);
          return;
        }

        System.Process.app.audio.play('pistol_shot', 0.5, false, this.scene, 0);
        System.Process.app.audio.play('penne_pistol_shot', 2, false, this.scene, 0);

        this.anims.play('attack');

        new this.bullet(this, 2, 'penne_3d');

        break;

      case 'automac1000':

        if (System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 <= 0) 
        {
          System.Process.app.audio.play('sword_swipe', 0.5, false, this.scene, 0);
          return;
        }

        System.Process.app.audio.play('automac1000_shot', 2, false, this.scene, 0);
        System.Process.app.audio.play('pistol_shot', 0.5, false, this.scene, 0);


        new this.bullet(this, 3, 'bullet_3d');

        break;
    }

  }

  //------------------------------------------------ weapon recoil


  public recoil(time: number): void 
  {

    if (this.name !== 'automac1000')
      return;

    if (this.controls.zoom) 
    {
      this.player.movement.z = Math.sin(-time * 0.035) * 0.055;
      this.player.movement.y = Math.sin(time * 0.035) * 0.025;
    }
    else 
    {
      this.player.movement.x = Math.sin(time * -0.035) * 0.055;
      this.player.movement.y = Math.sin(time * 0.035) * 0.055;
      this.player.movement.z = Math.sin(time * 0.035) * 0.055;
    }
  }


  //------------------------------------------------------ destroy hit point


  private destroyHitPoint(hitPoint?: ENABLE3D.ExtendedObject3D): void 
  {

    if (hitPoint && hitPoint.hasBody)
      this.scene.third.destroy(hitPoint);

    this.canAttack = true;
    this.anims.mixer.stopAllAction();
  }


}