import { System } from '../internals/Config';
import { THREE, ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player } from './player';


//------------------------------------------------------------------------- RIFLE

export class Rifle extends ExtendedObject3D {

  private scene: Scene3D
  private source: string

    constructor(scene: Scene3D, data: any)
    {
      super(); 
      this.scene = scene;
      this.name = 'rifle';
      this.source = ''//data.username;
     
      this._init('red');
    }

    private async _init(color: string)
    {

      const getGloveColor = async () => {
        switch(color)
        {
          case 'yellow':
              return 'orange';
          case 'orange':
            return 'green';
          case 'red':
            return 'yellow';
          case 'green':
            return 'blue';
          case 'blue':
            return 'red';
          case 'indigo':
            return 'purple';
          case 'purple':
            return 'indigo';
          default: return '';
        }
      }

      const gloveColor = await getGloveColor();
      
      this.scene.third.load.gltf('automac1000_arm').then((gltf: GLTF) => this.render(gltf, gloveColor));
    }
    
    private render(gltf: GLTF, color: string): void
    {
      this.add(gltf.scene);
  
      this.traverse((child: any) => { 
        
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

    public fire(gltf: GLTF): void
    {
      System.config.audio.play('automac1000_shot', 2, false, this.scene, 0);

      const 
        firstPersonCamPos = this.scene['controller'].firstPersonControls.target.position,
        direction = this.scene.third.camera.getWorldDirection(this.scene['player'].raycaster.ray.direction),
        x = direction.x * 1000,
        y = direction.y * 1000,
        z = direction.z * 1000,

      //bullet
        bullet = this.scene.third.physics.add.sphere (
          { 
            radius: 0.5,
            mass: 1,
            x: this.position.x,  
            y: this.position.y,  
            z: this.position.z
          }, 
          { phong: { color: 0x000000/* , visible: false */ } 
        });
        
        bullet.position.copy(firstPersonCamPos);
        bullet.rotation.copy(this.scene['controller'].firstPersonControls.target.rotation);
        bullet.body.applyForce(x, y, z);
        //System.config.events.socket.emit('DEATHMATCH: player attack', { source: this.source, damage: 3});

        bullet.body.on.collision(async (otherObject, event) => {

          await this.checkTarget(otherObject); 
          this.scene.third.destroy(bullet);
            
        });

      //shell casing
        this.scene.time.delayedCall(500, ()=> {
          const shellCasing = new ExtendedObject3D();
          shellCasing.name = 'bullet_3d';
          shellCasing.add(gltf.scene);
          shellCasing.scale.set(0.75, 0.75, 0.75);
          shellCasing.position.copy(this.position);
          shellCasing.rotation.copy(this.rotation);
          this.scene.third.add.existing(shellCasing);
          this.scene.third.physics.add.existing(shellCasing, {shape: 'sphere', radius: 0.1, collisionFlags: 4});
          shellCasing.body.applyForce(Math.random() * 10 + 1 > 5 ? -4 : 4, 0, 0);
          shellCasing.body.on.collision((otherObject, event) => {
            if (shellCasing.hasBody)
              this.scene.third.destroy(shellCasing);
        });
      });


    }

    private async checkTarget(otherObject: ExtendedObject3D): Promise<void>
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

      //---------------deathmatch

      if (otherObject.name.includes('player'))
      {

        this.scene['score']++;
        System.config.events.socket.emit('DEATHMATCH: player damage', { attacker: this.source, user: otherObject, damage: 3}); 
        // if (otherObject.hasBody) 
        // {
        //   this.scene.third.destroy(otherObject);
        //   System.config.audio.play('fire_fx', 6, false, this.scene, 0);
        // }
      }
    }
  }
  