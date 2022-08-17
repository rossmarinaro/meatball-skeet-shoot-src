
import { THREE, ExtendedObject3D, Scene3D, FirstPersonControls } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Rifle } from './rifle';
import { Pickup } from './pickup'; 
import { System } from '../internals/Config';

//------------------------------------------------- player

export class Player {

    private scene: Scene3D 
    private currentWeapon: any
    private raycaster: THREE.Raycaster
    private muzzlePoint: any
    private sensor: any
    private collide: boolean
    private isSelf: boolean | undefined
    private equipped: any

    public id: string | undefined
    public username: string
    public color: string
    public anims: string
    public alive: boolean
    public movement = {x: 0, y: 0, z: 0}
    public rotationSpeed: number
    public health: number
    public hitbox: any
    public self = {
      skin: new ExtendedObject3D(),
      object: new ExtendedObject3D() 
    }

    constructor(scene: Scene3D | any, isSelf?: boolean, data?: any)
    {
      this.scene = scene;
      this.isSelf = true//isSelf;
      this.health = 10//data.health;
      this.id = ''//data.id;
      this.username = ''//data.username; 
      this.color = 'yellow';
      this.alive = true;
      this.currentWeapon = null;
      this.muzzlePoint = null;
      this.collide = false;
      this.hitbox = null;
      this.anims = '';

      this._init(data);
    }
  
    private _init(data: any): void
    {

    ///init weapon if user

      if(this.isSelf === true)
      {
        this.scene.third.physics.add.existing(this.self.object, {shape: 'capsule', mass: 1.8, radius: 5, offset: {y: -5}, height: 38});
        this.self.object.body.setAngularFactor(0, 0, 0);
        this.currentWeapon = new Rifle(this.scene, data);

      }
      else 
      {
        //multiplayer skin

        this.scene.third.load.fbx('bh_model').then((obj: any) => {

          this.self.skin.add(obj); 

          for (let i in obj.animations) 
            this.self.skin.anims.add(obj.animations[i].name, obj.animations[i]);
            
          this.scene.third.animationMixers.add(this.self.skin.anims.mixer);  

          this.setState('Rifle Idle');
      
          this.self.skin.traverse((i: any) => {                                  
            
          //load texture
            if (i.isMesh)
            {                                                                 
              if (i.geometry.attributes.uv && i.name === 'body')
                this.scene.third.load.texture(`bh_uv_${this.color}`).then(texture => {
                  i.material.map = texture;
                  this.scene.third.add.existing(this.self.skin);
                }); 
        
              i.castShadow = i.receiveShadow = true;

              if (i.material)
              {
                i.material.metalness = 0.3;
                i.material.roughness = 0.3;
              }
            }
            if (i.name === 'mixamorigRightHandIndex1')
            {
              if (this.hitbox === null)
              {
                this.hitbox = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 10), new THREE.MeshLambertMaterial({color: 0xff0000}));
                this.hitbox.visible = false;
                this.hitbox.name = `player: ${this.id}`;
                this.scene.third.add.existing(this.hitbox);
                this.scene.third.physics.add.existing(this.hitbox); 
                this.hitbox.body.setCollisionFlags(6);
              }

              if (!this.equipped)
              {
                  this.equipped = this.scene.third.add.box({width: 1, height: 1, depth: 1});
                  this.equipped.visible = false;
                  const weapon = new Pickup(this.scene, 'automac1000');
                  Promise.resolve().then(()=>{
                      const pos = new THREE.Vector3();
                      this.scene.events.on('update', ()=> {
                        i.getWorldPosition(pos);
                        this.equipped.position.copy(pos); 
                        weapon.position.copy(this.equipped.position);
                        weapon.rotation.copy(this.self.skin.rotation);
                        i.attach(this.equipped);
                        if (this.hitbox !== null)
                          {
                            this.hitbox.position.copy(pos);
                            if (this.hitbox.hasBody)
                              this.hitbox.body.needUpdate = true; 
                          }
                      });
                  });
              }
            }
        });

        obj.scale.set(0.023, 0.023, 0.023);
        obj.position.set(0, -18, 0);
        obj.rotation.set(0, -140, 0);

      });

      
      }
  
    }

    /////////////////////////////////////// set players animation state

    private setState(state: string | null): void
    {
      if (state === this.self.skin.anims.current || state === null)
        return;

      //  this.self.skin.anims.play(state);
      //  System.config.events.socket.emit('DEATHMATCH: player anims', state);
    }

  ////////////////////////////////////////////

    public async attack()
    {
      if (!this.alive)
        return;
        
      const getCurrentWeapon = async ()=> {
        switch (this.currentWeapon.name)
        {
          case 'rifle': 
          //bullet casing 
              this.scene.third.load.gltf('bullet_3d').then((gltf: GLTF) => this.currentWeapon.fire(gltf));
            return 'Rifle Shoot';
          default:
              return null;
        }
      },
      attack = await getCurrentWeapon();
      this.setState(attack);
    }

 
  //////////////////////////////////////////

    public defaultStance(time: number, joystick1: any, keys: any): void
    {
      const 
        steady = ()=>{
            this.movement.x = Math.sin(time * -0.015) * 0.075;
            this.movement.y = Math.sin(time * 0.015) * 0.075;
            this.movement.z = Math.sin(time * 0.015) * 0.075;
        },
        trot = ()=>{
            this.movement.x = Math.sin(time * -0.003) * 0.01;
            this.movement.y = Math.sin(time * 0.003) * 0.01;
            this.movement.z = Math.sin(time * 0.003) * 0.01;
        }
        if (keys !== undefined)
            keys.w.isDown ? steady() : trot();
        else
            joystick1.forceY < -40 ? steady() : trot();
    }

  ////////////////////////////////////////

    public crouch(): void
    {
      this.movement.x = THREE.MathUtils.lerp(this.movement.x,this.movement.x - 0.5, 0.2);
      this.movement.y = THREE.MathUtils.lerp(this.movement.y, this.movement.y - 1, 0.2);   
      this.self.object.body.setAngularVelocityY(0);
      //this.scene.third.camera.position.y -= 10;
    }
  
  ////////////////////////////////////////////////

    
    public idle(): void
    {

      //this.self.skin.rotation.y = 1;
      this.setState('Rifle Idle');

      this.self.object.body.setVelocity(0, 0, 0); 
      this.self.object.body.setAngularVelocityY(0);
    }

  /////////////////////////////////////////
  
    public move(forceX: number, forceY: number): void
    {
      //if (System.config.multiPlayer.chat === true)
        //return;

      const cam = this.scene.third.camera,
            direction = cam.getWorldDirection(this.raycaster.ray.direction),
            x = direction.x * 100, 
            y = this.self.object.position.y, 
            z = direction.z * 100;

          direction.normalize();

    //right
      if (forceX > 40) 
        this.self.object.body.setVelocity(-z, y, x); 

    //left
      else if (forceX < -40) 
        this.self.object.body.setVelocity(z, y, -x);   
        
    //down
      else if (forceY < -40) 
        this.self.object.body.setVelocity(x, y, z); 

    //up
      else if (forceY > 40) 
        this.self.object.body.setVelocity(-x, y, -z); 

      this.setState('Rifle Run');

      if (this.self.object.body) 
        this.self.object.body.setAngularVelocityY(0);

    }

    look(x: number, y: number, camera: FirstPersonControls)
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
   
  
  //-----------------------------------------------
  
    public update(time: number): void
    {

      if (this.currentWeapon === null)
        return;
  
        this.raycaster = new THREE.Raycaster();
        const pos = new THREE.Vector3();
  
        this.raycaster.setFromCamera({ x: 0.6 - this.movement.x, y: -0.8 - this.movement.y }, this.scene.third.camera);
  
        pos.copy(this.raycaster.ray.direction);
        pos.multiplyScalar(0.8 + this.movement.z);
        pos.add(this.raycaster.ray.origin);
  
        this.currentWeapon.visible = this.alive === true ? true : false; 
        this.currentWeapon.position.copy(pos);
        this.currentWeapon.rotation.copy(this.scene.third.camera.rotation);

        this.raycaster.ray.origin.copy(this.scene.third.camera.position);

        this.anims = this.self.skin.anims.current;
    }
  }
  