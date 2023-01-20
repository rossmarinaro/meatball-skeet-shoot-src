
import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { PlayerItem } from './inventory/playerItem';


export class Bullet extends ENABLE3D.ExtendedObject3D { 

    private src: PlayerItem
    private damage: number
    private gltf: typeof System.Process.utils.GLTF

    constructor(src: PlayerItem, damage: number, key: string)
    {
      
      super();

      this.src = src;
      this.damage = damage;

      src.scene.third.load
      .gltf(key)
      .then(async (gltf: typeof System.Process.utils.GLTF) => {

        this.add(gltf.scene); 

        this.src.scene.third.add.existing(this); 

        this.gltf = gltf;

        let isZoomed = this.src.controls.zoom ? true : false;
        
        const currPos = await this.src.getCurrentPosition(),
              firePos = this.src.scene.third.transform.from2dto3d(
                src.scene['controller'].perspectiveControls.type === 'first' ? isZoomed ? 0 : 0.9 : 0.5, 
                isZoomed ? -0.6 : -0.8, 
                src.scene['controller'].perspectiveControls.type === 'first' ? 15 : 30
              );
      
          if (firePos)
            this.position.set(
              firePos.x, 
              System.Config.isPortrait(this.src.scene) || System.Config.isDesktop(this.src.scene) ? firePos.y : firePos.y - 0.5, 
              firePos.z
            );

          if (!this.hasBody)
            this.src.scene.third.physics.add.existing(this, {
              shape: 'sphere', 
              radius: 2, 
              mass: 2, 
              collisionFlags: 0
            });

        this.body.applyForce(currPos.x * 3000, currPos.y * 3000, currPos.z * 3000);
        this.body.setCcdMotionThreshold(1);
        this.body.setCcdSweptSphereRadius(0.2);
          
          //System.Process.app.events.socketEmit('DEATHMATCH: player attack', { source: this.src.source, damage: 3});
  
          this.body.on.collision(async (otherObject, event) => { 
  
            if (this.hasBody)
              this.src.scene.third.destroy(this);

              if (otherObject['key'] === 'meatball_3d') //meatball mini game score tally increases here
              {
        
                this.src.scene['score']++;
        
                if (otherObject.hasBody) 
                {
                  this.src.scene.third.destroy(otherObject);
                  System.Process.app.audio.play('fire_fx', 6, false, this.src.scene, 0);
                }
              }
  
              if (await Bullet.checkAttackSource(this.src.player, otherObject))
                System.Process.app.events.socketEmit('DEATHMATCH: player damage', { attacker: this.src.source, user: otherObject['playerID'], damage: this.damage}); 
              
          });

        this.traverse(async i => {
  
          if (i.isMesh)
          {
  
            i.castShadow = i.receiveShadow = true;
         
            this.scale.set(17, 17, 17);
            this.rotateY(90);
        
            System.Process.app.ThirdDimension.Inventory3D.decrement(this.src.scene, 'ammo', this.src.name);
        
            if (this.src.controls.perspectiveControls.type === 'third') //stop muzzle flash / shell casing if in third person
              return;
          
                //exec muzzle flash particles
          
                  this.src.anims.play('muzzle_flash'); 
                  
                  this.src.traverse((i: any) => {
                    if (i.name === 'muzzle')
                    {
                      i.visible = true;
                      this.src.scene.time.delayedCall(500, ()=> i.visible = false);
                     // new MuzzleFlash(this.src.scene, i, player.position.x, player.position.y, player.position.z);    
                    }
                  });
                
              //create shell casing

                this.src.scene.time.delayedCall(500, ()=> {

                  const shellCasing = new ENABLE3D.ExtendedObject3D;
                  shellCasing.name = 'bullet_3d';
                  shellCasing.add(this.gltf.scene);
                  shellCasing.scale.set(0.75, 0.75, 0.75);
                  shellCasing.position.copy(this.src.position);
                  this.src.scene.third.add.existing(shellCasing);
                  this.src.scene.third.physics.add.existing(shellCasing, {
                    shape: 'sphere', 
                    radius: 0.1, 
                    mass: 1200,
                    collisionFlags: 4
                  });

                  shellCasing.body.applyForce(Math.sin(500 * 0.035) * 0.055, 20, 0);
                  
                  shellCasing.body.on.collision((otherObject, event) => {

                    if (otherObject.name === 'level' && shellCasing.hasBody)
                      this.src.scene.third.destroy(shellCasing);
                });
              });

              }
            });     
        });
    }


    //------------------------ check attack source returns true if attackee is not self


    public static async checkAttackSource (player: any, object: ENABLE3D.ExtendedObject3D): Promise<Readonly<boolean>> 
    { 
      return object['objType'] === 'player' && object['playerID'] !== player.playerID ? true : false; 
    }




}