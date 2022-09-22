// import { System } from '../internals/Config';
// import { THREE, ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';
// import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Player } from './player';


// //------------------------------------------------------------------------- RIFLE

// export class Rifle extends ExtendedObject3D {

//   private scene: Scene3D
//   private source: string

//     constructor(scene: Scene3D, data: any)
//     {
//       super(); 
//       this.scene = scene;
//       this.name = 'rifle';
//       this.source = ''//data.username;
     
//       this._init('red');
//     }

//     private async _init(color: string)
//     {

//       const getGloveColor = async () => {
//         switch(color)
//         {
//           case 'yellow':
//               return 'orange';
//           case 'orange':
//             return 'green';
//           case 'red':
//             return 'yellow';
//           case 'green':
//             return 'blue';
//           case 'blue':
//             return 'red';
//           case 'indigo':
//             return 'purple';
//           case 'purple':
//             return 'indigo';
//           default: return '';
//         }
//       }

//       const gloveColor = await getGloveColor();
      
//       this.scene.third.load.gltf('automac1000_arm').then((gltf: GLTF) => this.render(gltf, gloveColor));
//     }
    
//     private render(gltf: GLTF, color: string): void
//     {
//       this.add(gltf.scene);
  
//       this.traverse((child: any) => { 
        
//         if (child.name === 'glove')
//           this.scene.third.load.texture(`glove_${color}`).then(texture => { 
//             child.material.map = texture;
//             this.scene.third.add.existing(this);
//           }); 
  
//         if (child.isMesh)
//         {
//           child.castShadow = child.receiveShadow = true;
//           if (child.material)
//           {
//             child.material.metalness = 0.3;
//             child.material.roughness = 0.3;
//           }
//         }
//       });
//     }

//     public fire(gltf: GLTF): void
//     {
//       System.config.audio.play('automac1000_shot', 2, false, this.scene, 0);

//       const 
//         firstPersonCamPos = this.scene['controller'].firstPersonControls.target.position,
//         direction = this.scene.third.camera.getWorldDirection(this.scene['player'].raycaster.ray.direction),
//         x = direction.x * 1000,
//         y = direction.y * 1000,
//         z = direction.z * 1000,

//       //bullet
//         bullet = this.scene.third.physics.add.sphere (
//           { 
//             radius: 0.5,
//             mass: 1,
//             x: this.position.x,  
//             y: this.position.y,  
//             z: this.position.z
//           }, 
//           { phong: { color: 0x000000/* , visible: false */ } 
//         });
        
//         bullet.position.copy(firstPersonCamPos);
//         bullet.rotation.copy(this.scene['controller'].firstPersonControls.target.rotation);
//         bullet.body.applyForce(x, y, z);

//       //destroy meatball targets

//         bullet.body.on.collision(async (otherObject, event) => {

//           await this.checkTarget(otherObject); 
//           this.scene.third.destroy(bullet);
            
//         });

//       //shell casing

//         this.scene.time.delayedCall(500, ()=> {
//           const shellCasing = new ExtendedObject3D();
//           shellCasing.name = 'bullet_3d';
//           shellCasing.add(gltf.scene);
//           shellCasing.scale.set(0.75, 0.75, 0.75);
//           shellCasing.position.copy(this.position);
//           shellCasing.rotation.copy(this.rotation);
//           this.scene.third.add.existing(shellCasing);
//           this.scene.third.physics.add.existing(shellCasing, {shape: 'sphere', radius: 0.1, collisionFlags: 4});
//           shellCasing.body.applyForce(Math.random() * 10 + 1 > 5 ? -4 : 4, 0, 0);
//           shellCasing.body.on.collision((otherObject, event) => {
//             if (shellCasing.hasBody)
//               this.scene.third.destroy(shellCasing);
//         });
//       });


//     }

//     private async checkTarget(otherObject: ExtendedObject3D): Promise<void>
//     {
//       //------------------skeet shoot

//       if (otherObject.name === 'meatball')
//       {

//         this.scene['score']++;

//         if (otherObject.hasBody) 
//         {
//           this.scene.third.destroy(otherObject);
//           this.scene['meatballs'].splice(otherObject, 1);
//           System.config.audio.play('fire_fx', 6, false, this.scene, 0);
//         }
//       }

//       //---------------deathmatch

//       if (otherObject.name.includes('player'))
//       {

//         this.scene['score']++;
//         System.config.events.socket.emit('DEATHMATCH: player damage', { attacker: this.source, user: otherObject, damage: 3}); 
//         // if (otherObject.hasBody) 
//         // {
//         //   this.scene.third.destroy(otherObject);
//         //   System.config.audio.play('fire_fx', 6, false, this.scene, 0);
//         // }
//       }
//     }
//   }
import { System } from '../internals/Config';
import { ExtendedObject3D, Scene3D, THREE } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player } from './player';
import { Inventory3D } from './inventory';

//------------------------------------------------------------------------- Automac1000

export class Automac1000 extends ExtendedObject3D {

    private scene: Scene3D
    private player: Player
    private source: string
    
    constructor(player: Player, scene: Scene3D)
    {
      super(); 
      this.scene = scene;
      this.player = player;
      this.name = 'automac1000';
      
      this.source = ''
     
      this._init('red');
    }

    private async _init(color: string): Promise<void>
    {

      const gloveColor = await this.player.getGloveColor(color);
      
      this.scene.third.load.gltf('automac1000').then((gltf: GLTF) => this.render(gltf, gloveColor));
    }
    
    private render(glb: GLTF, color: string): void
    {

      this.add(glb.scene);

      for (let i in glb.animations) 
        this.anims.add(glb.animations[i].name, glb.animations[i]);

        this.scene.third.animationMixers.add(this.anims.mixer); 
  
      this.traverse((child: any) => { 

        if (child.name === 'muzzle')
        {
          //console.log(child)//child.material.map = new Shaders
          child.opacity = 0.3;
          child.visible = false;
        }

        if (child.name === 'glove')
          this.scene.third.load.texture(`glove_${color}`).then(texture => { 
            child.material.map = texture;
            this.scene.third.add.existing(this);
          }); 
  
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
    }

    //--------------------------------------------- fire Automac1000

    public fire(gltf?: GLTF): void
    {
      
      if (Inventory3D.ammo.automac1000 <= 0)
      {
        System.config.audio.play('sword_swipe', 0.5, false, this.scene, 0);
        return;
      }

      System.config.audio.play('automac1000_shot', 2, false, this.scene, 0);

      const direction = this.scene.third.camera.getWorldDirection(this.scene['player'].raycaster.ray.direction),
            x = direction.x,
            y = System.isPortrait(this.scene) || System.isDesktop(this.scene) ? direction.y : direction.y + 0.125,
            z = direction.z;

      //bullet
        let isZoomed = this.scene['controller'].zoom ? true : false,
        
          firePos = this.scene.third.transform.from2dto3d(isZoomed ? 0 : 0.9, isZoomed ? -0.6 : -0.8, 5);

        if (firePos)
        {
          let bullet = this.scene.third.physics.add.sphere ({ 
            radius: 0.5,
            mass: 1,
            x: firePos.x, 
            y: System.isPortrait(this.scene) || System.isDesktop(this.scene) ? firePos.y : firePos.y - 0.5,
            z: firePos.z
          }, 
          { 
            phong: { 
              color: 0xffffff, 
              visible: true 
            }
        });

        bullet.rotation.copy(this.scene['controller'].firstPersonControls.target.rotation);
    
        bullet.body.applyForce(x * 3000, y * 3000, z * 3000);
        bullet.body.setCcdMotionThreshold(1);
        bullet.body.setCcdSweptSphereRadius(0.2);

        bullet.body.on.collision(async (otherObject, event) => {

          await this.checkTarget(otherObject); 

          if (bullet.hasBody && bullet !== undefined && bullet !== null)
            this.scene.third.destroy(bullet);
            
        });
      }

      //exec muzzle flash particles

        this.anims.play('muzzle_flash'); 
        
        this.traverse((i: any) => {
          if (i.name === 'muzzle')
          {
            i.visible = true;
            this.scene.time.delayedCall(500, ()=> i.visible = false);
           // new MuzzleFlash(this.scene, i, player.position.x, player.position.y, player.position.z);    
          }
        });

      //shell casing

        this.scene.time.delayedCall(500, ()=> {

          if (!gltf)
            return;

          const shellCasing = new ExtendedObject3D();
          shellCasing.name = 'bullet_3d';
          shellCasing.add(gltf.scene);
          shellCasing.scale.set(0.75, 0.75, 0.75);
          shellCasing.position.copy(this.position);
          this.scene.third.add.existing(shellCasing);
          this.scene.third.physics.add.existing(shellCasing, {
            shape: 'sphere', 
            radius: 0.1, 
            mass: 1200,
            collisionFlags: 4
          });

          if (firePos)
            shellCasing.body.applyForce(Math.sin(500 * 0.035) * 0.055, 20, 0);
          
          shellCasing.body.on.collision((otherObject, event) => {

            if (otherObject.name === 'level' && shellCasing.hasBody)
              this.scene.third.destroy(shellCasing);
        });
      });

      Inventory3D.decrement(this.scene, 'ammo', 'automac1000');

    }

    //---------------------------------------------------------


    public recoil (time: number): void
    {
      if (this.scene['controller'].zoom)
      {
        this.scene['player'].movement.z = Math.sin(-time * 0.035) * 0.055;
        this.scene['player'].movement.y = Math.sin(time * 0.035) * 0.025;
      }
      else
      {
        this.scene['player'].movement.x = Math.sin(time * -0.035) * 0.055;
        this.scene['player'].movement.y = Math.sin(time * 0.035) * 0.055;
        this.scene['player'].movement.z = Math.sin(time * 0.035) * 0.055;
      }
    }

    //---------------------------------------------------------


    private async checkTarget(otherObject: ExtendedObject3D, bullet?: ExtendedObject3D): Promise<void>
    {

      

      //------------------skeet shoot

      if (otherObject.name === 'meatball')
      {

        this.scene['score']++;

        if (otherObject.hasBody) 
        {
          this.scene.third.destroy(otherObject);
          System.config.audio.play('fire_fx', 6, false, this.scene, 0);
        }
      }

    }


  }
  