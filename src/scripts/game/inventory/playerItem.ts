import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../../internals/Config';

import { Actor } from '../Actor';
import { Player3D } from '../player';
import { Bullet } from '../Bullet';

//-------------------------------- player item base class (first person view holding weapon or item)

export class PlayerItem extends Actor {


  private flipY: boolean | undefined

  public scene: ENABLE3D.Scene3D
  public bullet: typeof Bullet = Bullet
  public player: Player3D
  public source: any
  public controls: any
  public zoom: { x: number, y: number } = { x: 0.0, y: 0.6 } 

  constructor(scene: ENABLE3D.Scene3D, name: string, flipY?: boolean) 
  {

    super(scene, name, 0, 0, 0, true, false, async (): Promise<void> => {  

      this.name = name;
      this.flipY = flipY;
      this.controls = this.scene['controller'];
      this.player = this.scene['player'] ? this.scene['player'] : null;
      this.source = this.player['data'] ? this.player['data'] : null;
  
      const item = await this.getItemZoomParams();
  
      this.zoom = { x: item[0], y: item[1] };

      const 
      
      fireTexture = new ENABLE3D.THREE.TextureLoader().load('assets/textures/fire.png'),

      fireShaderMaterial = System.Process.app.shaders.createShaderMaterial(
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
      
      //iterate child meshes
      
      this.traverse((child: any): void => {
    
      
        if (child.name.includes('glove'))
        {
          this.scene.third.load.texture(`glove_yellow`).then(texture => {
            child.material.map = texture;
            child.material.map.flipY = this.flipY;
          });
        }
      
      //iterate over muzzleflash meshes
      
        if (child.name.includes('muzzle')) 
        {
            
            fireTexture.wrapS = fireTexture.wrapT = ENABLE3D.THREE.RepeatWrapping;
        
            child.visible = false; 
        
            child.material = fireShaderMaterial;
        
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
  
        //add to scene
  
          this.scene.third.add.existing(this);
  
      });
        
    });
  }


//------------------------ get current position of weapon box


  public async getCurrentPosition(): Promise<{ x: number, y: number, z: number } | null> 
  {

    if (!this.player.raycaster)
      return null;

    const direction = this.scene.third.camera.getWorldDirection(this.player.raycaster.ray.direction);

    return {
      x: direction.x,
      y: System.Config.isPortrait(this.scene) || System.Config.isDesktop(this.scene) ? direction.y : direction.y + 0.125,
      z: direction.z
    }
  }



//----------------------------- get item


  private async getItemZoomParams(): Promise<[number, number]>
  {
    
    switch (this.name) 
    {
      case 'automac1000': 
        return [0.0, 0.6];
      default: 
        return [0.0, 0.0]
    }
  }


//---------------------------------------------------- fire weapon


  public async fire(): Promise<void>  
  {  

    //prevent action if mouse lock disabled (desktop only)

    if (!this.scene.input.mouse.locked && System.Config.isDesktop(this.scene))
      return;

    //weapon specific logic

    switch (this.name) 
    {  

      case 'automac1000':

        if(this.player.health > 1 || Number.isNaN(this.player.health))
          System.Process.app.shaders.setSelectiveBloom(20, 'muzzle');

        if (System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 <= 0) 
        {

          System.Process.app.audio.play('sword_swipe', 0.5, false, this.scene, 0);
          System.Process.app.ThirdDimension.Inventory3D.checkNextBestItem(this.scene);
          
          return;
        }

        System.Process.app.audio.play('automac1000_shot', 2, false, this.scene, 0);
        System.Process.app.audio.play('pistol_shot', 0.5, false, this.scene, 0);

        new this.bullet(this, 3, 'bullet_3d', 4, 1000);

      break;
    }

    this.traverse(async (i: any): Promise<void> => { 
      
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

    if (this.controls.zoom) 
    {
      this.player['movement'].z = Math.sin(-time * 0.035) * 0.055;
      this.player['movement'].y = Math.sin(time * 0.035) * 0.025;
    }
    else 
    {
      this.player['movement'].x = Math.sin(time * -0.035) * 0.055;
      this.player['movement'].y = Math.sin(time * 0.035) * 0.055;
      this.player['movement'].z = Math.sin(time * 0.035) * 0.055;
    }
  }

}

