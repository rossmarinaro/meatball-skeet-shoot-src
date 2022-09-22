

import { THREE, ExtendedObject3D, Scene3D, FirstPersonControls } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { System } from '../internals/Config';

import { ItemProp } from './ItemProp';
import { Inventory3D } from './inventory';

//------------------------------------------------- player

export class Player {

    private scene: Scene3D 
    private currentEquipped: any
    private collide: boolean
    private isSelf: boolean | undefined
    private equipped: any
    private canJump: boolean

    public raycaster: THREE.Raycaster
    public id: string | undefined
    public data: any
    public username: string | null
    public color: string
    public anims: string
    public alive: boolean
    public movement = {x: 0, y: 0, z: 0}
    public rotationSpeed: number
    public health: number
    public hitbox: any
    public itemProp: ItemProp | null
    public self = {
      skin: new ExtendedObject3D(),
      object: new ExtendedObject3D() 
    }

    constructor(scene: Scene3D | any, isSelf?: boolean, data?: any)
    {
      this.scene = scene;
      this.isSelf = isSelf;
      this.data = data;
      this.health = this.data ? this.data.health : Infinity;
      this.id = this.data ? this.data.id : 0;
      this.username = this.data ? this.data.username : null; 
      this.color = 'yellow';
      this.alive = true;
      this.collide = false;
      this.canJump = false;
      this.hitbox = null;
      this.anims = '';

      this.currentEquipped = {
        key: 'automac1000',
        obj: null,
        quantity: 0
      };

      this._init();
    }
  
    private _init(): void
    {



        this.scene.third.physics.add.existing(this.self.object, {shape: 'capsule', mass: 1.8, radius: 3, offset: { y: 5 }, height: 30});
        this.self.object.body.setAngularFactor(0, 0, 0);
        this.self.object.body.setFriction(0.1);
        this.self.object.body.setGravity(0, -200, 0);
        this.self.object.body.setPosition(150, 0, 50);


        this.self.object.body.on.collision(async (otherObject, event) => {

          if (otherObject.name === 'ladder')
            this.self.object.body.setVelocityY(100);
     
        //listen for items / aquires pickup in map

          Inventory3D.aquirePickup(this.scene, otherObject);

        });

    }


  //------------------------------------------------ set players animation state


    private setState(state: string | null): void
    {

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

      this.movement.x = THREE.MathUtils.lerp(this.movement.x,this.movement.x - 0.5, 0.2);
      this.movement.y = THREE.MathUtils.lerp(this.movement.y, this.movement.y - 1, 0.2);   
      this.self.object.body.setAngularVelocityY(0);
      //this.scene.third.camera.position.y -= 10;

    }
  
  //--------------------------------------------------- player idle

    
    public idle(): void
    {

      //this.self.skin.rotation.y = 1;
      //if (this.self.skin.anims.current)
       // return;

          this.setState(this.currentEquipped.key === 'rolling_pin1' ? 'idle' : 'Rifle Idle');

          if (this.isSelf === true)
          {
            this.self.object.body.setVelocityX(0);
            this.self.object.body.setVelocityZ(0);  
            this.self.object.body.setAngularVelocityY(0);
          }
     
    }


  //--------------------------------------------------- player jump


    public jump(): void
    {

      if (this.canJump === false)
        return;

      this.canJump = false;

      this.setState('jump');
      
     // System.config.audio.play('huh', 1, false, this.scene, 0); 

      this.self.object.body.applyImpulse({x: 0, y: 150, z: 0}, {x: 0, y: -200, z: 0})

    }


  //---------------------------------- player move

  
    public move(forceX: number, forceY: number): void
    {

      if (System.config.multiPlayer.chat === true || !this.raycaster)
        return;

      const cam = this.scene.third.camera,
            direction = cam.getWorldDirection(this.raycaster.ray.direction),
            x = direction.x * 100, 
            z = direction.z * 100;

          direction.normalize();

    //right
      if (forceX > 40) 
      {
        this.self.object.body.setVelocityX(-z);
        this.self.object.body.setVelocityZ(x);
      }

    //left
      else if (forceX < -40) 
      {  
        this.self.object.body.setVelocityX(z);
        this.self.object.body.setVelocityZ(-x);
      }
    //down
      else if (forceY < -40) 
      {
        this.self.object.body.setVelocityX(x);
        this.self.object.body.setVelocityZ(z);
      }
    //up
      else if (forceY > 40) 
      {
        this.self.object.body.setVelocityX(-x);
        this.self.object.body.setVelocityZ(-z);
      }

      this.setState(this.currentEquipped.key === 'rolling_pin1' ? 'run_no_gun' : 'Rifle Run');

      if (this.self.object.body) 
        this.self.object.body.setAngularVelocityY(0);

    }
    

    //-------------------------------------------- player look


    public look(x: number, y: number, camera: FirstPersonControls): void
    {
        
      camera.update(x, y);
      
    //object's body rotates with camera

      const 
      v3 = new THREE.Vector3(),
      rotation = this.scene.third.camera.getWorldDirection(v3),
      theta = Math.atan2(rotation.x, rotation.z),
      rotationMan = this.self.object.getWorldDirection(v3),
      thetaMan = Math.atan2(rotationMan.x, rotationMan.z),
      l = Math.abs(theta - thetaMan);
    
      this.rotationSpeed = 2; //4//isTouchDevice ? 2 : 4
    
      let d = Math.PI / 24

      if (l > d && l > Math.PI - d || theta < thetaMan) 
        this.rotationSpeed *= -1; 
      if (this.self.object.body) 
        this.self.object.body.setAngularVelocityY(this.rotationSpeed); 

    }

  //------------------------------------------------- player attack


    public async attack(): Promise<void>
    {

      if (!this.alive)
        return;
        
      const getCurrentWeapon = async ()=> {

        switch (this.currentEquipped.key)
        {
          case 'automac1000': 

            this.scene.third.load.gltf('bullet_3d').then((gltf: GLTF) => this.currentEquipped.obj.fire(gltf));
            return 'Rifle Shoot';

          case 'rolling_pin1': 
            
            this.currentEquipped.obj.fire();
            return 'strike';

          default: return null;
        }
        
      },
      attack = await getCurrentWeapon();

      this.setState(attack);
    }

  //--------------------------------------------- init powerup

  public initPowerup(type: string): void
  {
    switch (type)
    {
      case 'ikura_maki_tile':
        this.health += 4;
        System.config.audio.play('gulp', 1, false, this.scene, 0);
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

      let pos = this.self.skin.position; 
      new ItemProp(this.scene, equipped, pos.x, pos.y - 5, pos.z);
    }

  
  //----------------------------------------------- update on scene

  
    public update(time: number): void
    {

      if (this.currentEquipped.obj === null)
        return;

        this.health = Math.ceil(this.health);
  
        this.raycaster = new THREE.Raycaster();
        const pos = new THREE.Vector3(),
              movementY = (num: number) => { return num - this.movement.y };
  
        this.raycaster.setFromCamera({ 
          x: 0.6 - this.movement.x, 
          y: System.isPortrait(this.scene) || System.isDesktop(this.scene) ? movementY(-0.8) : movementY(-0.5) 
        }, 
        this.scene.third.camera); 
  
        pos.copy(this.raycaster.ray.direction);
        pos.multiplyScalar(0.8 + this.movement.z);
        pos.add(this.raycaster.ray.origin);
  
        this.currentEquipped.obj.visible = this.alive === true ? true : false; 
        this.currentEquipped.obj.position.copy(pos);
        this.currentEquipped.obj.rotation.copy(this.scene.third.camera.rotation);

        this.raycaster.ray.origin.copy(this.scene.third.camera.position);

        this.anims = this.self.skin.anims.current;

        if (this.collide === true)
          this.canJump = true;

        this.self.object.body.on.collision((otherObject, event) => {

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
          //     this.self.object.body.setVelocityY(0);
          //   }
          // });

        });
    }
  }
  