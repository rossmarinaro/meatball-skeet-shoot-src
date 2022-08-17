
//-------------------------------------------------    CONTROLLER

import { System } from '../internals/Config'; 
import { Player } from './player';
import { THREE, FirstPersonControls, ThirdPersonControls } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';


export class Controller {

  public scene: any
  public player: Player

  private speed: number
  private theta: THREE.Vector3 | number
  private rotation: number | any
  private pointerMoveX: number
  private pointerMoveY: number
  private deviceCheck: boolean
  private zoom: boolean
  private shoot: boolean
  private isFiring: boolean
  private crouching: boolean
  private keys: any
  private joystick1: any
  private joystick2: any
  private direction: THREE.Vector3 | number
  private joystickBase1: Phaser.GameObjects.Arc | null
  private joystickBase2: Phaser.GameObjects.Arc
  private joystickThumb1: Phaser.GameObjects.Arc
  private joystickThumb2: Phaser.GameObjects.Arc
  private zoomButton: Phaser.GameObjects.Arc | null
  private crouchButton: Phaser.GameObjects.Arc | null
  private shootButton: Phaser.GameObjects.Arc | null
  private chatButton: Phaser.GameObjects.Arc | null
  private firstPersonControls: FirstPersonControls

    constructor(scene: any, player: Player)
    {
        this.scene = scene;
        this.player = player;
        this.speed = 0;
        this.theta = 0;
        this.direction = 0;
        this.rotation = 0;
        this.pointerMoveX = 0;
        this.pointerMoveY = 0;
        this.zoom = false;
        this.shoot = false;
        this.isFiring = false
        this.joystick1 = null;
        this.joystick2 = null;
        this.shootButton = null;
        this.zoomButton = null;

        this._init(); 
    }

    private _init(): void
    {
        if (System.mobileAndTabletCheck())
        {
            const joystickPlugin = this.scene.plugins.get('rexvirtualjoystickplugin');
            
            this.deviceCheck = true;
            this.scene.input.addPointer(1);

            this.joystickBase1 = this.scene.add.circle(100, 450, 50, 0x000000).setAlpha(0.5);
            this.joystickThumb1 = this.scene.add.circle(100, 450, 30, 0xcccccc).setAlpha(0.5);
            this.joystick1 = joystickPlugin.add(this.scene, {
                forceX: 0,
                forceY: 0,
                x: 100,
                y: 450,
                radius: 60,
                base: this.joystickBase1,
                thumb: this.joystickThumb1
            });
            this.joystickBase2 = this.scene.add.circle(this.scene.scale.width - 50, 450, 50, 0x000000).setAlpha(0.5);
            this.joystickThumb2 = this.scene.add.circle(this.scene.scale.width - 100, 450, 30, 0xcccccc).setAlpha(0.5);
            this.joystick2 = joystickPlugin.add(this.scene, {
                forceX: 0,
                forceY: 0,
                x: this.scene.scale.width - 100,
                y: 450,
                radius: 60,
                base: this.joystickBase2,
                thumb: this.joystickThumb2
            });
            this.shootButton = this.scene.add.circle(100, 550, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.shoot = true)
                .on('pointerup', ()=> this.shoot = false)
                .on('pointerout', ()=> this.shoot = false);
            this.zoomButton = this.scene.add.circle(this.scene.scale.width - 100, 550, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.zoom = true)
                .on('pointerup', ()=> this.zoom = false)
                .on('pointerout', ()=> this.zoom = false);
            this.crouchButton = this.scene.add.circle(this.scene.scale.width - 50, 510, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.crouching = true)
                .on('pointerup', ()=> this.crouching = false)
                .on('pointerout', ()=> this.crouching = false);
            this.chatButton = this.scene.add.circle(this.scene.scale.width - 150, 590, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', this.openChatWindow)
        }
        else ////keyboard
        {
            this.deviceCheck = false;
            this.keys = {
                w: this.scene.input.keyboard.addKey('w'),
                a: this.scene.input.keyboard.addKey('a'),
                s: this.scene.input.keyboard.addKey('s'),
                d: this.scene.input.keyboard.addKey('d'),
                q: this.scene.input.keyboard.addKey('q'),
                e: this.scene.input.keyboard.addKey('e'),
                shift: this.scene.input.keyboard.addKey('shift')
            }

        //chat window event listener

            this.scene.input.keyboard.on('keydown-SHIFT', this.openChatWindow);

        //// lock the pointer and update the first person control
  
            this.scene.input
            .on('pointerdown', () => this.scene.input.mouse.requestPointerLock())
            .on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (this.scene.input.mouse.locked)
                {
                  this.pointerMoveX = pointer.movementX; 
                  this.pointerMoveY = pointer.movementY;
                  this.firstPersonControls.update(this.pointerMoveX, this.pointerMoveY);
                }
            });
        }
    
  
    //// add first person controls
  
        this.firstPersonControls = new FirstPersonControls(this.scene.third.camera, this.player.self.object, {});
        this.firstPersonControls.update(0, 0);

    //// third person controls
  
        //this.thirdPersonControls = new ThirdPersonControls(this.scene.third.camera, this.player.self.object, {offset: new THREE.Vector3(0, 1, 0), targetRadius: 3});

    //------------------------------------------------- on scene update
  
        this.scene.events.on('update', (time: number, delta: number) => {

          this.firstPersonControls.update(0, 0);
          //this.thirdPersonControls.update(0, 0);

          this.direction = new THREE.Vector3(),
          this.rotation = this.scene.third.camera.getWorldDirection(this.direction);
          this.speed = 1.4;
          this.theta = Math.atan2(this.rotation.x, this.rotation.z);
  
        ////update depending on device
          if (this.player !== null)
            this.deviceCheck === true ? this.dumpJoyStickState() : this.dumpKeyState();
  
            this.zoom ? this.zoomWeapon() : this.player.defaultStance(time, this.joystick1, this.keys);
            if (this.crouching)
                this.player.crouch();
  
            if (this.shoot)
              this.fireWeapon(time);
  
            if (this.shoot === false)
                System.config.audio.stop('automac1000_shot', this.scene);
        });
    }
  
  //---------------------------- METHODS

    private openChatWindow (): void
    {
      //this.scene.scene.get('Chat')['sendMessage']();
     // this.scene.scene.get('Chat')['toggleChatWindow']();
    }
  
    private zoomWeapon(): void
    {
      //this.crossHairs.alpha = 0
      this.player.movement.x = THREE.MathUtils.lerp(this.player.movement.x, 0.6, 0.2);
      this.player.movement.y = THREE.MathUtils.lerp(this.player.movement.y, -0.8 + 1.8, 0.2);
      this.player.movement.z = THREE.MathUtils.lerp(this.player.movement.z, -0.45, 0.2);
    }
  
  ////////////////////////////////////
  
    private fireWeapon(time: number): void
    {
  
        this.player.movement.x = Math.sin(time * -0.035) * 0.055;
        this.player.movement.y = Math.sin(time * 0.035) * 0.055;
        this.player.movement.z = Math.sin(time * 0.035) * 0.055;
  
        if (this.isFiring === true)
            return;
  
        this.isFiring = true;
        this.scene.time.delayedCall(250, ()=> this.isFiring = false);

        this.player.attack();

    }
  
  
  //-------------------------------keyboard
  
    public dumpKeyState(): void
    {
        this.zoom = this.scene.input.mousePointer.rightButtonDown();
        this.shoot = this.scene.input.mousePointer.leftButtonDown();
  
        if (this.keys.q.isDown)
        {
          this.crouching = true;
          //this.scene.third.camera.rotateZ(0.2);
          //this.firstPersonControls.offset = new THREE.Vector3(Math.sin(this.theta + Math.PI * 0.5) * 0.4, 0, Math.cos(this.theta + Math.PI * 0.5) * 0.4);
        }
        else if (this.keys.e.isDown)
        {
          this.crouching = false;
          //this.scene.third.camera.rotateZ(-0.2);
          //this.firstPersonControls.offset = new THREE.Vector3(Math.sin(this.theta - Math.PI * 0.5) * 0.4, 0, Math.cos(this.theta - Math.PI * 0.5) * 0.4);
        }

        
        const movePlayer = (x: number, y: number) => {
          this.player.move(x, y);
          this.player.look(this.pointerMoveX / 5, this.pointerMoveY / 5, this.firstPersonControls);
        }

        if (this.keys.w.isUp && this.keys.a.isUp && this.keys.s.isUp && this.keys.d.isUp)
        
          this.player.idle();
        
        else 
        {
          if (this.keys.w.isDown)
            movePlayer(0, -41);
          else if (this.keys.s.isDown)
            movePlayer(0, 41);  
        //// move sideways
          else if (this.keys.a.isDown)
            movePlayer(-41, 0);
          else if (this.keys.d.isDown)
            movePlayer(41, 0);
        }

    }
  
    //--------------------------- joysticks
  
    public dumpJoyStickState(): void
    {
      if (this.joystick1 !== null)
        this.joystick1.force !== 0 ?
        this.player.move(this.joystick1.forceX, this.joystick1.forceY) : this.player.idle();
      if (this.joystick2 !== null)
        this.firstPersonControls.update(this.joystick2.forceX  / 5, this.joystick2.forceY / 5);
      
    }
  }
  