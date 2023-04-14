
import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { PlayerItem } from './inventory/playerItem';



export class Bullet extends ENABLE3D.ExtendedObject3D { 

  private src: PlayerItem
  private damage: number
  private gltf: typeof System.Process.utils.GLTF

  constructor (

    src: PlayerItem, 
    damage: number, 
    key: string | null, 
    scale: number, 
    distanceToDamage: number,
    hasCasing?: boolean

  )
  {
    
    super();

    this.src = src;
    this.damage = damage;
    this.userData['damage'] = damage; 
    this.userData['active'] = true;

    if (key) //if bullet model, load it

    src.scene.third.load
    .gltf(key)
    .then(async (gltf: typeof System.Process.utils.GLTF): Promise<void> => {

      this.add(gltf.scene); 

      this.scale.set(scale, scale, scale);

      this.src.scene.third.add.existing(this); 

      this.gltf = gltf;

      const isZoomed = this.src.controls.zoom ? true : false,
            currPos = await this.src.getCurrentPosition(),
            firePos = this.src.scene.third.transform.from2dto3d(
              src.scene['controller'].perspectiveControls.type === 'first' ? isZoomed ? 0 : 0.9 : 0.5, 
              isZoomed ? -0.6 : -0.8, 
              src.scene['controller'].perspectiveControls.type === 'first' ? 10 : 30
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
          radius: 1, 
          mass: 2, 
          collisionFlags: 0
        });

      this.body.setAngularVelocityZ(30);
      this.body.applyForce(currPos.x * 7000, currPos.y * 7000, currPos.z * 7000);
      this.body.setCcdMotionThreshold(1e-2);
      this.body.setCcdSweptSphereRadius(0.2);

    //destroy on contact or after delay
      
      this.body.on.collision(async () => {

          if (this.hasBody)
            this.src.scene.third.destroy(this);
      });


      this.traverse(async i => {

        if (i.isMesh)
        {

          i.castShadow = i.receiveShadow = true;
       
          this.rotateY(90);
      
          //create shell casing

            if (!hasCasing)
              return;

            this.src.scene.time.delayedCall(500, ()=> {

              const shellCasing = new ENABLE3D.ExtendedObject3D;
              shellCasing.name = 'bullet_3d';
              shellCasing.add(this.gltf.scene);
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

      //decrement ammo

      System.Process.app.ThirdDimension.Inventory3D.decrement(this.src.scene, 'ammo', this.src.name);

    });


  //---------------raycast intersection with target

    let collisionBuffer = false;

    const player = this.src.scene['player'];

    this.src.scene.third['factories'].scene.children.filter((target: ENABLE3D.ExtendedObject3D): void => {

      if (this.src.scene.third.scene3D['enemies'].includes(target))
      {

        const intersects = player.raycaster.intersectObject(target, true);

        if (intersects.length > 0 && !collisionBuffer) //stop if no intersection with raycast
        {

          collisionBuffer = true;

          if (player.position.distanceTo(target.position) > distanceToDamage) //stop if distance to damage is greater than cap
            return;

          const delay = player.position.distanceTo(target.position) / distanceToDamage;

          this.src.scene.time.delayedCall(delay, async () => {

            target.children[0].children.map(group => {

              group.children.forEach(child => {

              //indicate damage by emitting white on target materials

                if (child.material['emissive'])
                {

                  child.material['emissive'].r = 255;
                  child.material['emissive'].g = 255;
                  child.material['emissive'].b = 255;

                  this.src.scene.time.delayedCall(100, () => {

                    child.material['emissive'].r = 0;
                    child.material['emissive'].g = 0;
                    child.material['emissive'].b = 0;
                    
                  });
                }
              });
            });

            //reduce target health or destroy
           
            target['health'] -= this.damage;

            if (target['health'] <= 0)
              target['onDestroy']();

            //socket emit damage

            if (await Bullet.checkAttackSource(player, target))
              System.Process.app.events.socketEmit('DEATHMATCH: player damage', { 
                attacker: this.src.source, 
                user: target['playerID'], 
                damage: this.damage
              });
              
          });
        }
      }
    });
  }


  //------------------------ check attack source returns true if attackee is not self


  public static async checkAttackSource (player: any, object: ENABLE3D.ExtendedObject3D): Promise<Readonly<boolean>> 
  { 
    return object['objType'] === 'player' && object['playerID'] !== player.playerID ? true : false; 
  }

}