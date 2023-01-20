
import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { Actor } from './Actor';


//------------------------------------------------- player

export class Player3D extends Actor {

    private currentEquipped: { key: string, obj: any, quantity: number } = {key: '', obj: null, quantity: 0}

    private collide: boolean
    private isSelf: boolean | undefined
    private canJump: boolean

    public initialized: boolean = false
    public objType: string = 'player'
    public raycaster: ENABLE3D.THREE.Raycaster | null = null
    public data: any
    public username: string | null
    public playerID: string | undefined
    public color: string
    public alive: boolean
    public movement: { x: number, y: number, z: number, direction: string | null } = { x: 0, y: 0, z: 0, direction: null }
    public rotationSpeed: number
    public health: number = 10
    public itemProp: Actor | null = null
    public rigidBody: ENABLE3D.ExtendedObject3D

    constructor (

      scene: ENABLE3D.Scene3D,  
      posX: number, 
      posY: number, 
      posZ: number, 
      isSelf?: boolean, 
      data?: any

    )
    {
      super(scene, 'bh_model', true, false, () => {
        
        this.isSelf = isSelf;
        this.data = data;
        this.health = data ? data.health : Infinity;
        this.playerID = data ? data.id : 0;
        this.username = data ? data.username : null; 
        this.color = data && data.skin ? data.skin : 'red';
        this.alive = true;
        this.collide = false;                
        this.canJump = false;
  
        if (this.isSelf === true)
        {
          this.rigidBody = new ENABLE3D.ExtendedObject3D;  
          this.rigidBody.position.set(posX, posY, posZ);
        }

      //current-equipped data

      const capsuleBody = {
        shape: 'capsule', 
        mass: 1.8, 
        radius: 3, 
        offset: { y: 5 }, height: 10
      },

      startingWeapon = this.data && this.data.currentEquipped ? this.data.currentEquipped : 'rolling_pin1';

      scene.data['weapons'].push(startingWeapon);

        this.currentEquipped = {
          key: startingWeapon,
          obj: null,
          quantity: 0
        };

        this.idle();

        this.traverse((i: any) => {                                  
              
          //------------------load texture
  
            if (i.isMesh)
            {                            

              if (i.geometry.attributes.uv && i.name === 'body')
                this.scene.third.load
                .texture(`bh_uv_${this.color}`)
                .then(texture => {

                    i.material.map = texture;

                    this.position.set(posX, posY, posZ);
                    this.scene.third.add.existing(this);
                    this.scene.third.physics.add.existing(this, capsuleBody); 
                    this.body.setCollisionFlags(6);  

                    if (this.isSelf === true)
                    {

                    //set default weapon

                      System.Process.app.ThirdDimension.Inventory3D.setItem(this.scene, this.currentEquipped.key); 

                   
                      this.scene.third.physics.add.existing(this.rigidBody, capsuleBody);
                      
                      this.rigidBody.body.setAngularFactor(0, 0, 0);
                      this.rigidBody.body.setFriction(0.1);
                      this.rigidBody.body.setGravity(0, -200, 0);
                      this.rigidBody.body.setPosition(posX, posY, posZ);
                     
                      this.rigidBody.body.on.collision(async (otherObject, event) => { 

                        if (otherObject.name === 'ladder')
                          this.rigidBody.body.setVelocityY(100);
                  
                      //listen for items / aquires pickup in map

                        System.Process.app.ThirdDimension.Inventory3D.aquirePickup(this.scene, otherObject);
            
                      });
                    }
                  }); 
          
                i.castShadow = i.receiveShadow = true;
  
                if (i.material)
                {
                  i.material.metalness = 0.3;
                  i.material.roughness = 0.3;
                }
            }
            if (i.name === 'mixamorigRightHandIndex1') //sets player's third person item
            {

              let itemOrigin: ENABLE3D.ExtendedObject3D | null = null;

              if (itemOrigin === null)
              {
  
                itemOrigin = this.scene.third.add.box({width: 1, height: 1, depth: 1});
                itemOrigin.visible = false;
                                              
                Promise.resolve().then(
  
                  ()=>{   
         
                      const pos = new ENABLE3D.THREE.Vector3();
  
                      this.scene.events.on('update', ()=> {
            
                        i.getWorldPosition(pos);
  
                        itemOrigin?.position.copy(pos); 
  
                        if (this.itemProp !== null)
                        {
                          this.itemProp.position.copy(pos);
                          this.itemProp.rotation.y = this.obj.rotation.y//* 0.25;
                        }

                        i.attach(itemOrigin);

                        if (this.hasBody)
                          this.body.needUpdate = true; 
  
                      });
                  });
              }
            }
        });
      
      //sets 3d model's origin

        this.obj.position.set(0, -13, 0); 
        this.obj.rotation.set(0, -140, 0);

        //initialized
 
        this.initialized = true;

        //update

        scene.events.on('update', (time: number): void => this.update(time));

      });
    }

  //------------------------------------------------ set players animation state


    private setState(state: string | null): void
    {

      if (state === this.anims.current || state === null)
        return;

        this.anims.play(state);

        System.Process.app.events.socketEmit('DEATHMATCH: player anims', state);
    }

 
  //---------------------------------------------------- default stances


    public defaultStance(time: number, joystick1: any, keys: any, leftStick: any): void
    {
      if (
        (keys && keys.w.isDown) || 
        (joystick1 && joystick1.forceY < -40) || 
        (leftStick && leftStick.y === -1) 
      )
      {
        this.movement.x = Math.sin(time * -0.015) * 0.075;
        this.movement.y = Math.sin(time * 0.015) * 0.075;
        this.movement.z = Math.sin(time * 0.015) * 0.075;
      } 
      else
      {
        this.movement.x = Math.sin(time * -0.003) * 0.01;
        this.movement.y = Math.sin(time * 0.003) * 0.01;
        this.movement.z = Math.sin(time * 0.003) * 0.01;
      }
    }

  //--------------------------------------------------- player crouch


    public crouch(): void
    {

      this.movement.x = ENABLE3D.THREE.MathUtils.lerp(this.movement.x,this.movement.x - 0.5, 0.2);
      this.movement.y = ENABLE3D.THREE.MathUtils.lerp(this.movement.y, this.movement.y - 1, 0.2);   
      
      if (this.isSelf)
        this.rigidBody.body.setAngularVelocityY(0);
      //this.scene.third.camera.position.y -= 10;

    }
  
  //--------------------------------------------------- player idle

    
    public idle(): void
    {

      this.setState(
        this.currentEquipped.key === 'rolling_pin1' ? 
        'idle' : 'Rifle Idle'
      );

      if (this.isSelf === true && this.rigidBody.body)
      {

        this.rigidBody.body.setVelocityX(0);
        this.rigidBody.body.setVelocityZ(0);  
        this.rigidBody.body.setAngularVelocityY(0);  
        this.movement.direction = null;
      }
        
    }


  //--------------------------------------------------- player jump


    public jump(): void
    {

      if (this.canJump === false)
        return;

      this.canJump = false;

      this.setState('jump');
      
      System.Process.app.audio.play('huh', 1, false, this.scene, 0); 

      if (this.isSelf === true)
        this.rigidBody.body.applyImpulse({x: 0, y: 150, z: 0}, {x: 0, y: -200, z: 0})

    }


  //---------------------------------- player move

  
    public move(forceX: number, forceY: number): void
    {

      if (!this.alive /* || System.Process.app.multiPlayer.chat === true */ || !this.raycaster)
        return; 

      const cam = this.scene.third.camera,
            direction = cam.getWorldDirection(this.raycaster.ray.direction),
            x = direction.x * 100, 
            z = direction.z * 100;

          direction.normalize();

      if (!this.rigidBody.body)
        return;

    //right

      if (forceX > 40) 
      {
        this.rigidBody.body.setVelocityX(-z);
        this.rigidBody.body.setVelocityZ(x);
        this.movement.direction = 'right'; 
      }

    //left

      else if (forceX < -40) 
      {  
        this.rigidBody.body.setVelocityX(z);
        this.rigidBody.body.setVelocityZ(-x);
        this.movement.direction = 'left';
      }

    //down

      else if (forceY < -40) 
      {
        this.rigidBody.body.setVelocityX(x); 
        this.rigidBody.body.setVelocityZ(z);
        this.movement.direction = 'down';
      }

    //up

      else if (forceY > 40) 
      {
        this.rigidBody.body.setVelocityX(-x);
        this.rigidBody.body.setVelocityZ(-z); 
        this.movement.direction = 'up';
      }

     
      this.setState(
        this.currentEquipped.key === 'rolling_pin1' ? 
        'run_no_gun' : 'Rifle Run'
      );

      if (this.rigidBody.body) 
        this.rigidBody.body.setAngularVelocityY(0);

     
    }
    

  //------------------------------------------------- player attack


    public async attack(): Promise<void>
    {

      if (!this.alive)
        return;
        
      const getCurrentItem = async () => {

        this.currentEquipped.obj.fire();

        switch (this.currentEquipped.key)
        {
  
            case 'rolling_pin1': return 'strike';
            case 'penne_pistol': return 'Pistol Shoot';
            case 'automac1000': return 'Rifle Shoot';

            default: return null;
        }
      }, 
      
      attack = await getCurrentItem();

      this.setState(attack);

    }

  //--------------------------------------------- init powerup

  public initPowerup(type: string): void
  {
    switch (type)
    {
      case 'ikura_maki_tile':
        this.health += 4;
        System.Process.app.audio.play('gulp', 1, false, this.scene, 0);
      break;
    }
  }

  //---------------------------------------------- apply proper glove color based on player's skin


    public async getGloveColor (color: string): Promise<string>
    {
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
        default: 
          return 'yellow';
      }
    }

  //---------------------------------------------- drop item / weapon
  

    public dropItem (equipped: string): void
    {
      if (equipped === 'rolling_pin1')
        return;

      const pos = this.position; 
      new System.Process.app.ThirdDimension.Inventory3D.pickup(this.scene, equipped, pos.x, pos.y - 5, pos.z);
    }


  //----------------------------------------------- swap item / weapon

    public swapItem (data: any): void
    {

      if (this.itemProp !== null)
        this.itemProp.remove(this.itemProp.children[0]);

      this.currentEquipped.key = data.item.key;
      this.itemProp = new Actor(this.scene, data.item.key, true, false, () => {
        this.itemProp?.traverse((i: any): void => {
          this.scene.third.add.existing(this.itemProp);
          System.Process.app.ThirdDimension.Inventory3D.setItemForThirdPerson(this.itemProp, i);
          this.idle();
        });
      });
    }
  
  //----------------------------------------------- update on scene

  
    public update(time: number): void
    {

      this.health = Math.ceil(this.health);

      if (this.isSelf === true && this.rigidBody.body) 
      {

        const pos = new ENABLE3D.THREE.Vector3, 
              movementY = (num: number) => { return num - this.movement.y };

      this.raycaster = new ENABLE3D.THREE.Raycaster;

      this.raycaster.setFromCamera(
        { 
          x: 0.6 - this.movement.x, 
          y: System.Config.isPortrait(this.scene) || System.Config.isDesktop(this.scene) ? movementY(-0.8) : movementY(-0.5) 
        }, this.scene.third.camera
      ); 

      this.raycaster.ray.origin.copy(this.scene.third.camera.position);

      pos.copy(this.raycaster.ray.direction);
      pos.multiplyScalar(0.8 + this.movement.z);
      pos.add(this.raycaster.ray.origin);

      const direction = this.scene.third.camera.getWorldDirection(this.raycaster.ray.direction);

      //set skin's rotation

        this.rotation.y = this.movement.direction === 'up' ? 
        -Math.atan2(direction.x, direction.z) : 
        -Math.atan2(direction.z, direction.x);

      //swap player fp weapon perspective view

      if (this.currentEquipped.obj)
      {
        if (this.alive === true && this.itemProp)
        {
          if (this.scene['controller'].perspectiveControls.type === 'first')
          {
            this.currentEquipped.obj.visible = true;
            this.itemProp.visible = false;
            this.visible = false;
          } 
          else
          {
            this.currentEquipped.obj.visible = false;
            this.itemProp.visible = true;
            this.visible = true;
          }
        }

        this.currentEquipped.obj.position.copy(pos);
        this.currentEquipped.obj.rotation.copy(this.scene.third.camera.rotation);   
      }

   
        //copy player's skin position to its physics body

        if (this['obj'])
          this.position.copy(this.rigidBody.position);

        this.rigidBody.body.needUpdate = true;
        this.rigidBody.body.on.collision((otherObject, event) => {

        if (event !== 'end')
          this.collide = true;
        else 
        {
          this.collide = false;
          //this.onRamp = false;
        } 
        // otherObject.traverse((i: any) => {
        //   if (i.name === 'ramp')
        //   {
        //     this.onRamp = true;
        //     this.rigidBody.body.setVelocityY(0);
        //   }
        // });

        }); 

        
        if (this.collide && this.body.velocity.y <= 0)
          this.canJump = true;

      }


      //hide third person player / weapon if dead

      if (!this.alive && this.itemProp)
      {
        this.visible = false;
        this.itemProp.visible = false;
      }
    }

    //--------------------------------- destroy

    public destroy(): void
    {
      this.alive = false;
      this.dropItem(this.currentEquipped.key);
      this.remove(this.children[0]);    
      if (this.hasBody === true && this.body)
        this.scene.third.destroy(this);
    }
  }
  