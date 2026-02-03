import * as ENABLE3D from '@enable3d/phaser-extension'
import { System } from '../internals/Config'
import { Actor } from './Actor'
import { ThirdDimension } from '../internals/ThirdDimension'
import { Pickup3D } from './pickup'
import { Inventory3D } from './inventory/inventoryManager'
import { AudioManager } from '../internals/Audio'
import { EventManager } from '../internals/Events'

//------------------------------------------ player 3D

export class Player3D extends Actor {

  private currentEquipped: { key: string | null, obj: any, quantity: number } = { key: null, obj: null, quantity: 0 }
  private isSelf?: boolean
  private canJump: boolean
  private canDamage: boolean
  private justFired: boolean
  private isJump: boolean
  private isAttack: boolean
  private invincible: boolean
  private speed: number
  private rayFromCamCoords: ENABLE3D.THREE.Vector2

  public initialized: boolean = false
  public objType: string = 'player'
  public raycaster: ENABLE3D.THREE.Raycaster | null = null
  public data: any
  public username: string | null
  public playerID?: string
  public color: string
  public directionFacing: string
  public alive: boolean
  public movement: { x: number, y: number, z: number, direction: string | null } = { x: 0, y: 0, z: 0, direction: null }
  public desiredPosition: ENABLE3D.THREE.Vector3
  public rotationSpeed: number
  public health: number = 10
  public itemProp: Actor | null = null
  public rigidBody: ENABLE3D.ExtendedObject3D

  constructor (

      scene: ENABLE3D.Scene3D,
      posX: number = 0,
      posY: number = 0,
      posZ: number = 0,
      isSelf?: boolean,
      data?: any

    )
    {

      super(scene, 'bh_model', 0, 0, 0, true, false, () => {

        this.isSelf = isSelf;
        this.data = data;
        this.health = data ? data.health : Infinity;
        this.playerID = data ? data.id : 0;
        this.username = data ? data.username : null;
        this.color = data && data.skin ? data.skin : 'red';
        this.directionFacing = 'right';

        this.alive = true;
        this.canDamage = true;
        this.canJump = false;
        this.isJump = false;
        this.isAttack = false;
        this.justFired = false;
        this.invincible = false;
        this.speed = 1;
        this.desiredPosition = new ENABLE3D.THREE.Vector3;
        this.rayFromCamCoords = new ENABLE3D.THREE.Vector2;

        //player's starting weapon

        const startingWeapon = this.data && this.data.currentEquipped ? this.data.currentEquipped : 'rolling_pin1';

        if (this.isSelf) {
          this.rigidBody = new ENABLE3D.ExtendedObject3D;
          this.rigidBody.position.set(posX, posY, posZ);

          if (startingWeapon && (scene.data['weapons'] instanceof Array && !scene.data['weapons'].includes(startingWeapon)))
            scene.data['weapons'].push(startingWeapon);
        }

        this.currentEquipped = { key: startingWeapon, obj: null, quantity: 0 };

        this.idle();

        this.traverse(child => {

          //load texture
//console.log(child.type)
          if (child.isMesh)
          {
            const mesh = (child as unknown as ENABLE3D.THREE.Mesh), 
                  capsuleBody = { shape: /* 'hacd' */ 'capsule', mass: 1.8, radius: 3, height: 10 };

            if (mesh.geometry.attributes.uv && mesh.name === 'body')

              //player texture: unmasked only if red (not in multiplayer)

              this.scene.third.load.texture(`bh_uv_${this.color}`)
                .then(texture => {

                    const material = new ENABLE3D.THREE.MeshStandardMaterial({ map: texture });

                    mesh.material = material;

                    //cel shading

                    mesh.material = new ENABLE3D.THREE.MeshToonMaterial({ map: material.map });
                    mesh.castShadow = mesh.receiveShadow = true;

                    this.position.set(posX, posY, posZ);
                    this.scene.third.add.existing(this); 
                    
                    //@ts-ignore
                    this.scene.third.physics.add.existing(this, capsuleBody); 
                    this.body.setCollisionFlags(6);  

                    if (this.isSelf)
                    {
                        //set default weapon

                        if (this.currentEquipped.key)
                        {
                            Inventory3D.setItem(this.scene, this.currentEquipped.key);

                        //add to inventory if doesn't already exist

                            if (
                                this.data && this.data.currentEquipped !== void 0 &&
                                this.data.currentEquipped !== null &&
                                !Inventory3D.currentInventory.includes(this.currentEquipped.key)
                            )
                                Inventory3D.currentInventory.push(this.currentEquipped.key);
                        }

                        this.scene.third.physics.add.existing((this.rigidBody as unknown as ENABLE3D.ExtendedMesh), capsuleBody);

                        this.rigidBody.body.setAngularFactor(0, 0, 0);
                        this.rigidBody.body.setFriction(0.1);
                        this.rigidBody.body.setGravity(0, -200, 0);
                        this.rigidBody.body.setPosition(posX, posY, posZ);

                        this.rigidBody.body.on.collision(async otherObject => {

                            if (otherObject.name.includes('ladder'))
                                this.rigidBody.body.setVelocityY(100);

                            if (otherObject.name.includes('hazard'))
                                this.triggerDamageCallback(1, this);

                            //listen for items / aquires pickup in map

                            if (!otherObject.name.includes('round'))
                                Inventory3D.aquirePickup(this.scene, otherObject);

                            });
                        }
                    });
            }

            //other player default item

            else if (this.currentEquipped.key)
                this.swapItem(this.currentEquipped.key);

            if (child.name === 'mixamorigRightHandIndex1') //sets player's third person item
            {
                let itemOrigin: ENABLE3D.ExtendedMesh | null = null;

                if (itemOrigin === null)
                {
                    itemOrigin = this.scene.third.add.box();
                    itemOrigin.visible = false;

                    Promise.resolve().then(() => {

                        const pos = new ENABLE3D.THREE.Vector3;

                        this.scene.events.on('update', () => {

                            child.getWorldPosition(pos);

                            itemOrigin?.position.set(pos.x, pos.y, pos.z);

                        //update players item prop position / rotation

                            if (this.itemProp !== null) 
                            {
                                this.itemProp.position.set(pos.x, pos.y, pos.z);

                                if (this.hasBody)
                                    this.itemProp.rotation.y = this.rotation.y + 230;
                            }

                            if (itemOrigin !== null)
                                child.attach(itemOrigin);

                            if (this.hasBody)
                                this.body.needUpdate = true;

                        });
                    });
                }
            }
        });

      //initialized

        this.initialized = true;

      //update

        scene.events.on('update', () => this.update());

      });
    }


  //------------------------------------------------ set players animation state


    private setState(state: string | null): void
    {
      if (state === this.anims.current || state === null)
        return;

      this.anims.play(state);
    }


  //-------------------------------------------------- get stance


    private async getStance(type: string): Promise<string | null>
    {
      switch (type)
      {
        case 'idle':

          switch (this.currentEquipped.key)
          {
            case 'penne_pistol':
            case 'automac1000':
            case 'rigatoni_rocket_launcher': return 'Rifle Idle';
            case 'rolling_pin1': default: return 'idle';
          }

        case 'move':

          switch (this.currentEquipped.key)
          {
            case 'penne_pistol':
            case 'automac1000':
            case 'rigatoni_rocket_launcher': return 'Rifle Run';
            case 'rolling_pin1': default: return 'run_no_gun';
          }

        default:
          return null;

      }

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


    public async idle(): Promise<void>
    {
      if (this.isJump || this.isAttack)
        return;

      this.setState(await this.getStance('idle'));

      if (this.isSelf && this.rigidBody.body)
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
      if (!this.canJump)
        return;

      this.canJump = false;
      this.isJump = true;

      this.scene.time.delayedCall(1200, () => this.isJump = false);

      this.setState('jump');

      AudioManager.play('huh', 0.8, false, this.scene, 0);

      if (this.isSelf)
        this.rigidBody.body.applyImpulse({x: 0, y: 150, z: 0}, {x: 0, y: -200, z: 0})

    }


  //---------------------------------- player move


    public async move(forceX: number, forceY: number): Promise<void>
    {
      if (
        !this.alive ||
        !this.raycaster
      )
        return;

      this.justFired = false;

      const cam = this.scene.third.camera,
            direction = cam.getWorldDirection(this.raycaster.ray.direction),
            x = (direction.x * this.speed) * 100,
            z = (direction.z * this.speed) * 100;

      if (!this.rigidBody.body)
        return;

    //right

      if (forceX > 40)
      {
        this.rigidBody.body.setVelocityX(-z);
        this.rigidBody.body.setVelocityZ(x);
        this.movement.direction = 'right';
        this.directionFacing = 'right';
      }

    //left

      if (forceX < -40)
      {
        this.rigidBody.body.setVelocityX(z);
        this.rigidBody.body.setVelocityZ(-x);
        this.movement.direction = 'left';
        this.directionFacing = 'left';
      }


    //down

    if (forceY < -40)
    {
        this.rigidBody.body.setVelocityX(x);
        this.rigidBody.body.setVelocityZ(z);
        this.movement.direction = 'down';
    }

    //up

    if (forceY > 40)
    {
        this.rigidBody.body.setVelocityX(-x);
        this.rigidBody.body.setVelocityZ(-z);
        this.movement.direction = 'up';
    }

      //apply state

      this.setState(await this.getStance('move'));

      if (this.rigidBody.body)
        this.rigidBody.body.setAngularVelocityY(0);


    }



  //------------------------------------------------- player attack


    public async attack(): Promise<void>
    {
      if (
        !this.alive ||
        !this.currentEquipped.obj ||
        (this.scene['controller'].perspectiveControls.type === 'third' && this.movement.direction === 'up')
      )
        return;

      this.justFired = true;
      this.isAttack = true;

      this.scene.time.delayedCall(1200, () => this.isAttack = false);

      const getCurrentItem = async () => {

        this.itemProp?.traverse(i => {
          if (i.name.includes('muzzle'))
            i.visible = true;
        });

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
      case 'ikura_maki_tile': this.incrementHealth(4); break;

      case 'beer_tile':

          this.invincible = true;
          this.speed = 0.5;
          this.scene.time.delayedCall(10000, () => {
            this.invincible = false;
            this.speed = 1;
          });

      break;

      case 'coffee':

        this.speed = 2;
        this.scene.time.delayedCall(10000, () => this.speed = 1);

      break;

    }

    AudioManager.play('gulp', 1, false, this.scene, 0);

    this.scene.time.delayedCall(100, () => AudioManager.play('frigyeah', 1, false, this.scene, 0));
  }


  //---------------------------------------------- apply proper glove color based on player's skin


    public async getGloveColor (color: string): Promise<string>
    {
      switch(color)
      {
        default: case 'yellow':
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
      }
    }

  //---------------------------------------------- drop item / weapon


    public dropItem (equipped: string): void {
        if (equipped !== 'rolling_pin1')
            new Pickup3D(this.scene, equipped, this.position.x, this.position.y - 5, this.position.z);
    }



  //----------------------------------------------- swap item / weapon (makes new Actor)


    public swapItem (item: string): void
    {
        if (this.itemProp !== null) {
            this.itemProp.children.forEach((child: ENABLE3D.THREE.Object3D) => this.itemProp?.remove(child));
            this.scene.third.scene.remove(this.itemProp);
            this.itemProp = null;
        }

        this.currentEquipped.key = item;

        this.itemProp = new Actor(this.scene, item, this.position.x, this.position.y, this.position.z, true, false, () => {

            this.itemProp?.traverse(child => {

                if (this.itemProp) {
                    this.scene.third.add.existing(this.itemProp);
                    Inventory3D.setItemForThirdPerson(this.itemProp, child);   
                } 

                this.idle();
            });
        });
    }


  //------------------------------------------------


    private movementY (num: number): number { 
        return num - this.movement.y; 
    };


  //----------------------------------------------- update on scene


    private async update(): Promise<void>
    {
      if (!this.scene.third || !this.scene.third.camera)
        return;

      this.health = Math.ceil(this.health);

      if (this.isSelf && this.initialized)
      {

        if (!this.raycaster)
            this.raycaster = new ENABLE3D.THREE.Raycaster;

        this.scene.third.camera.getWorldDirection(this.raycaster.ray.direction);

        //set raycast origin

        if (this.rayFromCamCoords) {
            this.rayFromCamCoords.set(0.6 - this.movement.x, this.movementY(System.Config.isPortrait(this.scene) || System.Config.isDesktop(this.scene) ? -0.8 : -0.5));
            this.raycaster.setFromCamera(this.rayFromCamCoords, this.scene.third.camera);
        }

        //set player's first person item to ray origin (player)

        this.raycaster.ray.origin.copy(this.scene.third.camera.position);

        this.pos.copy(this.raycaster.ray.direction);
        this.pos.multiplyScalar(0.8 + this.movement.z);
        this.pos.add(this.raycaster.ray.origin);

        //swap player fp weapon perspective view

        const controls = this.scene['controller'];
        
        if (!controls) 
            return;
        
        //update first person item visibility

        if (this.currentEquipped.obj)
        {
          if (this.alive && this.itemProp)
          {

            this.itemProp.traverse((child: ENABLE3D.ExtendedObject3D) => {
              if (child.name.includes('muzzle') && !controls.isFiring)
                child.visible = false;
            });

            if (controls.perspectiveControls?.type === 'first')
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

          this.currentEquipped.obj.position.copy(this.pos);
          this.currentEquipped.obj.rotation.copy(this.scene.third.camera.rotation);
        }

        else if (controls.perspectiveControls?.type === 'first')
          this.visible = false;

        else
          this.visible = true;

        //copy player's skin position to its physics body

        if (this.rigidBody.body)
        {
          //set rotation when moving

          const direction = this.scene.third.camera.getWorldDirection(this.raycaster.ray.direction);

          if (this.movement.direction !== null)
            this.rotation.y = await this.getRotationY(direction);

          else if (controls.perspectiveControls?.type === 'first' || this.justFired)
            this.rotation.y = Math.atan2(direction.normalize().x, direction.normalize().z);

          this.position.copy(this.rigidBody.position);

          this.rigidBody.body.needUpdate = true;

          this.rigidBody.body.on.collision(otherObject => {

            if (!otherObject.name.includes('bh_model'))
              this.canJump = true;
          });
        }
      }

      //hide third person player / weapon if dead

      if (!this.alive && this.itemProp) {
        this.visible = false;
        this.itemProp.visible = false;
      }

    }


    //----------------------------------- player's Y rotation


    private getRotationY(direction: ENABLE3D.THREE.Vector3): Promise<number>
    {
        return new Promise(res => {

            switch(this.movement.direction)
            {
            case 'down':
                res(Math.atan2(direction.normalize().x, direction.normalize().z));
            case 'up':
                res(Math.atan2(-direction.normalize().x, -direction.normalize().z));
            case 'left':
                res(Math.atan2(direction.normalize().x, direction.normalize().z) + 45);
            case 'right':
                res(Math.atan2(direction.normalize().x, direction.normalize().z) - 45);
            }
        });
    }


    //---------------------------------- health increase


    private async incrementHealth(amount: number): Promise<void>
    {
        if (this.health + amount > 10)
            return;

        this.health += amount;

        if (this.health >= 3)
            (await import ('../shaders/main')).ShaderManager.postProcessingWholeScene = false;
    }


    //----------------------------------- damage event


    public async triggerDamageCallback(damage: number, attackee: Actor): Promise<void>
    {
        if (!this.canDamage || this.invincible)
            return;

        this.canDamage = false;

        this.scene.cameras.main.flash(700, 255, 0, 0);

        //damage direction indicator

        const HUD = this.scene.scene.get('HUD3D');

        if (this.position.x + this.position.z > attackee.position.x + attackee.position.z)
            HUD['indicateDamageDirection']('front');

        if(this.position.x + this.position.z < attackee.position.x + attackee.position.z)
            HUD['indicateDamageDirection']('back');

        if ((this.position.x + this.position.z) * 90 > (attackee.position.x + attackee.position.z) * 90)
            HUD['indicateDamageDirection']('left');

        if((this.position.x + this.position.z) * 90 < (attackee.position.x + attackee.position.z) * 90)
            HUD['indicateDamageDirection']('right');

        //set flash and reset post processing

        this.scene.time.delayedCall(500, () => {

            HUD['resetIndicator']();

            this.scene.cameras.main.flash(500, 255, 0, 0);
            this.canDamage = true;
        });

        //set flash and reset post processing

        this.scene.time.delayedCall(500, () => {
            this.scene.cameras.main.flash(500, 255, 0, 0);
            this.canDamage = true;
        });

        //decrement player health

        this.health -= damage;

        AudioManager.play('ouch_snd', 1, false, this.scene, 0);

        if (this.health <= 2) {
            const { ShaderManager } = (await import ('../shaders/main'));
            ShaderManager.postProcessingWholeScene = true;
        }

        //player dead

        if (this.health <= 0) {
            EventManager.ee?.emit('retry');
            ThirdDimension.shutDown(this.scene);
        }

    }


    //--------------------------------- destroy player object


    public destroy(): void
    {
        this.alive = false;

        if (this.currentEquipped.key)
            this.dropItem(this.currentEquipped.key);

        this.remove(this.children[0]);
        
        if (this.currentEquipped.obj)
            this.currentEquipped.obj.remove(this.currentEquipped.obj.children[0]);

        if (this.hasBody && this.body) {
            //@ts-ignore
            this.scene.third.destroy(this);
        }
    }
  }
