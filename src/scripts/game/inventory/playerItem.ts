import * as ENABLE3D from '@enable3d/phaser-extension'
import { ThirdDimension } from '../../internals/ThirdDimension'
import { System } from '../../internals/Config'
import { Bullet } from '../Bullet'
import { Player3D } from '../player'
import { Actor } from '../Actor'
import { Inventory3D } from './inventoryManager'
import { BloomLayers, ShaderManager } from '../../shaders/main'
import { AudioManager } from '../../internals/Audio'

//-------------------------------- player item base class (first person view holding weapon or item)

export class PlayerItem extends Actor 
{
    private static fireTexture: ENABLE3D.THREE.Texture

    private flipY: boolean
    private canAttack: boolean = true
    public scene: ENABLE3D.Scene3D
    
    public player: Player3D
    public source: any
    public controls: any
    public zoom: { x: number, y: number } = { x: 0.0, y: 0.6 } 

    constructor(scene: ENABLE3D.Scene3D, name: string, flipY: boolean = false) 
    {
        super(scene, name, 0, 0, 0, true, false, async () => {  

            this.name = name;
            this.flipY = flipY;
            this.controls = this.scene['controller'];
            this.player = this.scene['player'] ? this.scene['player'] : null;
            this.source = this.player['data'] ? this.player['data'] : null;

            if (!PlayerItem.fireTexture) {
                PlayerItem.fireTexture = await this.scene.third.load.texture('fire-texture-3d');
                PlayerItem.fireTexture.wrapS = PlayerItem.fireTexture.wrapT = ENABLE3D.THREE.RepeatWrapping;
            }
        
            const item = await this.getItemZoomParams(), 
                playerColor = this.player['data'] && this.player['data'].skin ? this.player['data'].skin : 'red',
                gloveColor = await this.player['getGloveColor'](playerColor),
                    
            fireShaderMaterial = (await import ('../../shaders/main')).ShaderManager.createShaderMaterial(
                'pnoise_Vert', 
                'muzzleFlash_Frag', 
                {
                    blending: 'AdditiveBlending',
                    depthTest: true, 
                    transparent: true,
                    uniforms: {
                        alpha: { value: Math.random() * 1 },
                        tExplosion: { type: 't', value: PlayerItem.fireTexture },
                        time: { type: 'f', value: 0.0 },
                        resolution: { value: new ENABLE3D.THREE.Vector2(innerWidth, innerHeight) }
                    }
                }
            );

            this.zoom = { x: item[0], y: item[1] };

            //traverse child meshes
                
            this.traverse(child => {
            
                if (this.name === 'penne_pistol')
                    child.position.z -= 0.15;

                if (child.isMesh)
                {
                    const mesh = (child as unknown as ENABLE3D.THREE.Mesh);
            
                    if (mesh.name.includes('glove'))
                        this.scene.third.load.texture(`glove_${gloveColor}`).then(texture => {
                            const material = new ENABLE3D.THREE.MeshStandardMaterial({ map: texture });
                            if (material.map) {
                                material.map.flipY = this.flipY;
                                mesh.material = material;
                            }
                        });
            
                    if (mesh.name.includes('muzzle')) { 
                        mesh.material = fireShaderMaterial;
                        mesh.layers.enable(BloomLayers.WEAPONS);
                        mesh.visible = false;
                        scene.third.renderer.compile(mesh, scene.third.camera, scene.third.scene);
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

    if (!this.player.raycaster || !this.scene.third)
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
      case 'rolling_pin1': 
      case 'automac1000': 
        return [0.0, 0.6];
      case 'penne_pistol': 
        return [0.3, 0.6];
      case 'rigatoni_rocket_launcher':
        return [0.6, 0.8];
      default: 
        return [0.0, 0.0]
    }
  }


//---------------------------------------------------- fire weapon


  public async fire(): Promise<void>  
  {  

    //in third person mode, prevent action if mouse lock disabled (desktop only)

    if (
        !this.canAttack ||
        ThirdDimension.camType === 3 && 
        !this.scene.input.mouse?.locked && 
        System.Config.isDesktop(this.scene)
    )
        return;

    if (!this.name.includes('rolling_pin') && Inventory3D.ammo[this.name] <= 0) {

        AudioManager.play('sword_swipe', 0.5, false, this.scene, 600);
        
        return;
    }

    //weapon specific logic

    switch (this.name) 
    {   

        case 'rolling_pin1':

            this.canAttack = false;

            this.anims.play('attack');

            this.scene.time.delayedCall(800, () => {
                this.anims.mixer.stopAllAction();
                this.canAttack = true;

                AudioManager.play('sword_swipe', 0.5, false, this.scene, 0);
                new Bullet(this, 3, null, 1, 50);
            });

        break;

        case 'penne_pistol':

            this.canAttack = false;

            if(this.player.health >= 3 || Number.isNaN(this.player.health))
                ShaderManager.setSelectiveBloom(4, 'muzzle');

            this.scene.time.delayedCall(400, () => {
                this.anims.mixer.stopAllAction();
                this.canAttack = true;
            });


            AudioManager.play('pistol_shot', 0.5, false, this.scene, 0);
            AudioManager.play('penne_pistol_shot', 2, false, this.scene, 0);

            this.anims.play('attack');

            new Bullet(this, 2, 'penne_3d', 4, 500);

        break;

        case 'automac1000':

            if(this.player.health >= 3 || Number.isNaN(this.player.health))
                ShaderManager.setSelectiveBloom(2, 'muzzle');

            AudioManager.play('automac1000_shot', 2, false, this.scene, 0);
            AudioManager.play('pistol_shot', 0.5, false, this.scene, 0);

            new Bullet(this, 3, 'bullet_3d', 4, 1000);

        break;

        case 'rigatoni_rocket_launcher':

            this.canAttack = false;

            this.scene.time.delayedCall(400, () => {

                this.anims.mixer.stopAllAction();
                this.canAttack = true;
            });


            AudioManager.play('rigatoni_rocket_shot', 3, false, this.scene, 0);

            this.anims.play('attack');

            new Bullet(this, 6, 'meatball_3d', 2, 1500);

        break;
    }

    //swap items if ammo is 0

    this.scene.time.delayedCall(250, () => {

        if (!this.name.includes('rolling_pin') && Inventory3D.ammo[this.name] <= 0)
            Inventory3D.checkNextBestItem(this.scene);
    });

    this.traverse(async child => { 
      
      //muzzle particle positioning and uniform updates
        
      if (child.name.includes('muzzle'))
      {
        if(ThirdDimension.camType === 2)
          return;
 
        child.visible = true;

        child.rotation.x += Math.random() * 1000;
        child.rotation.y += Math.random() * 1000;
        child.rotation.z += Math.random() * 1000;

        child.scale.set(Math.random() * 0.07, Math.random() * 0.1, Math.random() * 0.15);

        if (child.isMesh) {
            const mesh = child as unknown as ENABLE3D.THREE.Mesh;
            if (mesh.material['uniforms']) {
                mesh.material['uniforms'].alpha.value = Math.random() * 1;
                mesh.material['uniforms'].time.value += 0.01;
            }
        }

        this.scene.time.delayedCall(200, () => child.visible = false);

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

