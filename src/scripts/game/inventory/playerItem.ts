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
  public zoomY: number = 0.6

  constructor(scene: ENABLE3D.Scene3D, name: string, flipY?: boolean) 
  {

    super();

    this.scene = scene;
    this.name = name;
    this.flipY = flipY;
    this.controls = this.scene['controller'];
    this.player = this.scene['player'] ? this.scene['player'] : null;
    this.source = this.player.data ? this.player.data.username : null;

    this.init();

  }


  //-------------------------------------------

  private async init(): Promise<void> 
  {

    this.scene.third.load.gltf(this.name).then((glb: typeof System.Process.utils.GLTF) => {

      this.add(glb.scene);

      for (let i in glb.animations)
        this.anims.add(glb.animations[i].name, glb.animations[i]);

      this.scene.third.animationMixers.add(this.anims.mixer);

      this.obj = glb;

      this.traverse((child: any) => {

        if (this.name === 'penne_pistol')
          child.position.z -= 0.15;

        if (child.name === 'glove')
          this.scene.third.load.texture('glove_yellow').then(texture => {
            child.material.map = texture;
            child.material.map.flipY = this.flipY;
            this.scene.third.add.existing(this);
          });

        //iterate over muzzleflash meshes

        if (child.name.includes('muzzle')) 
        {

          const fireTexture = new ENABLE3D.THREE.TextureLoader().load('assets/textures/fire.png');

          fireTexture.wrapS = fireTexture.wrapT = ENABLE3D.THREE.RepeatWrapping;

          child.visible = false; 

          child.material = System.Process.app.shaders.createShaderMaterial(
            'pnoise_Vert', 
            'muzzleFlash_Frag', 
            {
              blending: 'AdditiveBlending',
              depthTest: true, 
              transparent: true,
              uniforms: {
                  alpha: { value: Math.random() * 1 },
                  tExplosion: { type: 't', value: fireTexture },
                  time: { type: 'f', value: 0.0 },
                  resolution: { value: new ENABLE3D.THREE.Vector2(innerWidth, innerHeight)}
              }
            }
          );

        }

        else if (child.isMesh) 
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

    const direction = this.scene.third.camera.getWorldDirection(this.player.raycaster.ray.direction);

    return {
      x: direction.x,
      y: System.Config.isPortrait(this.scene) || System.Config.isDesktop(this.scene) ? direction.y : direction.y + 0.125,
      z: direction.z
    }
  }



  //---------------------------------------------------- fire weapon

  public async fire(): Promise<void> 
  {

    if (System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 <= 0) 
    {
      System.Process.app.audio.play('sword_swipe', 0.5, false, this.scene, 0);
      return;
    }

    System.Process.app.audio.play('automac1000_shot', 2, false, this.scene, 0);
    System.Process.app.audio.play('pistol_shot', 0.5, false, this.scene, 0);

    System.Process.app.shaders.setSelectiveBloom(20, 'muzzle');

    new this.bullet(this, 3, 'bullet_3d', 4, 1000, true);

    this.traverse(async (i: any) => { 
      
      //muzzle particle positioning and uniform updates
        
      if (i.name.includes('muzzle'))
      {
 
        i.visible = true;

        i.rotation.x += Math.random() * 1000;
        i.rotation.y += Math.random() * 1000;
        i.rotation.z += Math.random() * 1000;

        i.scale.set(Math.random() * 0.07, Math.random() * 0.1, Math.random() * 0.15);

        i.material.uniforms.alpha.value = Math.random() * 1;
        
        i.material.uniforms.time.value += 0.01;

        this.scene.time.delayedCall(200, () => {

          i.visible = false;

          if(this.player.health > 1 || Number.isNaN(this.player.health))
            System.Process.app.shaders.postProcessing = false;
          
          System.Process.app.shaders.objectSelection = null;
          
        });

      }
    });

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




}