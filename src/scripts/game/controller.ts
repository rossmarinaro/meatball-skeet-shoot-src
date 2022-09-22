
//-------------------------------------------------    CONTROLLER

import { System } from '../internals/Config'; 
import { Player } from './player';
import { THREE, FirstPersonControls, ThirdPersonControls, Scene3D } from '@enable3d/phaser-extension';


export class Controller {

  private scene: Scene3D
  private player: Player
  private gamePadStatus: number
  private speed: number
  private theta: THREE.Vector3 | number
  private rotation: number | any
  private pointerMoveX: number
  private pointerMoveY: number
  private zoom: boolean
  private shoot: boolean
  private isFiring: boolean
  private crouching: boolean
  private jump: boolean
  private keys: any
  private joystick1: any
  private joystick2: any
  private rightStick: any
  private leftStick: any
  private direction: THREE.Vector3 | number
  private buttonA: Phaser.GameObjects.Arc | null
  private buttonB: Phaser.GameObjects.Arc | null
  private buttonC: Phaser.GameObjects.Arc | null
  private buttonD: Phaser.GameObjects.Arc | null
  private buttonE: Phaser.GameObjects.Arc | null
  private buttonF: Phaser.GameObjects.Arc | null
  private joystickBase1: Phaser.GameObjects.Arc | null
  private joystickBase2: Phaser.GameObjects.Arc
  private joystickThumb1: Phaser.GameObjects.Arc
  private joystickThumb2: Phaser.GameObjects.Arc
  private firstPersonControls: FirstPersonControls

    constructor(scene: any, player: Player)
    {
      this.scene = scene;
      this.player = player;
      this.gamePadStatus = 0;
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


      this._init(); 
    }

    private _init(): void
    {
        if (System.mobileAndTabletCheck()) //virtual controls
        {
            const joystickPlugin = this.scene.plugins.get('rexvirtualjoystickplugin');
            
            this.scene.input.addPointer(1);

            this.joystickBase1 = this.scene.add.circle(100, 450, 50, 0x000000).setAlpha(0.5);
            this.joystickThumb1 = this.scene.add.circle(100, 450, 30, 0xcccccc).setAlpha(0.5);
            this.joystick1 = joystickPlugin['add'](this.scene, {
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
            this.joystick2 = joystickPlugin['add'](this.scene, {
                forceX: 0,
                forceY: 0,
                x: this.scene.scale.width - 100,
                y: 450,
                radius: 60,
                base: this.joystickBase2,
                thumb: this.joystickThumb2
            });
            this.buttonA = this.scene.add.circle(40, 500, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', this.openMenu);
            this.buttonB = this.scene.add.circle(100, 550, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.shoot = true)
                .on('pointerup', ()=> this.shoot = false)
                .on('pointerout', ()=> this.shoot = false);
            this.buttonC = this.scene.add.circle(this.scene.scale.width - 100, 550, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.zoom = true)
                .on('pointerup', ()=> this.zoom = false)
                .on('pointerout', ()=> this.zoom = false);
            this.buttonD = this.scene.add.circle(this.scene.scale.width - 50, 510, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.crouching = true)
                .on('pointerup', ()=> this.crouching = false)
                .on('pointerout', ()=> this.crouching = false);
            this.buttonE = this.scene.add.circle(this.scene.scale.width - 50, 590, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=> this.jump = true)
                .on('pointerup', ()=> this.jump = false)
                .on('pointerout', ()=> this.jump = false);
            this.buttonF = this.scene.add.circle(this.scene.scale.width - 150, 590, 20, 0x000000).setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', this.openChatWindow); 

          //listen for resize

            this.scene.scale.on('resize', ()=> this.resizeWindow(this.scene), false);
            screen.orientation?.addEventListener('change', ()=> this.resizeWindow(this.scene), false);
            screen.orientation?.addEventListener('webkitfullscreenchange', ()=> this.resizeWindow(this.scene), false);
        }
        else ////keyboard
        {
            this.keys = {
              w: this.scene.input.keyboard.addKey('w'),
              a: this.scene.input.keyboard.addKey('a'),
              s: this.scene.input.keyboard.addKey('s'),
              d: this.scene.input.keyboard.addKey('d'),
              q: this.scene.input.keyboard.addKey('q'),
              e: this.scene.input.keyboard.addKey('e'),
              shift: this.scene.input.keyboard.addKey('shift'),
              space: this.scene.input.keyboard.addKey('space'),
              tab: this.scene.input.keyboard.addKey('tab')
            }

        //trigger inventory menu
            
          this.scene.input.keyboard.on('keydown-TAB', this.openChatWindow);

        //open chat window

          this.scene.input.keyboard.on('keydown-SHIFT', this.openMenu);

        //// lock the pointer and update the first person control
  
            this.scene.input
            .on('pointerdown', () => !this.scene.scene.get('Menu3D').scene.settings.active && this.scene.input.mouse.requestPointerLock())
            .on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (this.scene.input.mouse.locked)
                {
                  this.pointerMoveX = pointer.movementX; 
                  this.pointerMoveY = pointer.movementY;
                  this.firstPersonControls.update(this.pointerMoveX, this.pointerMoveY);
                }
            });
        }

      ////gamepad

        this.scene.input.gamepad.on('down', (pad: any, button: any, status: number) => { 

          this.gamePadStatus = status;

          if (button.index === 9) //start
            this.openMenu();

          if (button.index === 8) //select
            this.openChatWindow();

          if (pad.A || pad.R1 || pad.R2) 
            this.shoot = true;
          if (pad.B) 
            this.jump = true;
          if (pad.Y) 
            this.zoom = true;
          if (pad.X) 
            this.crouching = true;
        })
        .on('up', (pad: any, button: any, status: number) => { 

          this.gamePadStatus = status;

            this.shoot = false;
            this.jump = false;
            this.crouching = false;
            this.zoom = false;
        });
          
  
    //// add first person controls
  
        this.firstPersonControls = new FirstPersonControls(this.scene.third.camera, this.player.self.object, {});
        this.firstPersonControls.update(0, 0);
        this.firstPersonControls.offset = new THREE.Vector3(0, -4.5, 0);

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
  
        ////update depending on device / controller, keyboard input

    
          if (this.player !== null)
          {

            System.config.input.type === 'touch' === true ? this.dumpVirtualJoyStickState() : this.dumpKeyState();

            if (this.scene.input.gamepad['_pad1'])
              this.dumpGameControllerState(); 
          }
  
            this.zoom ? 
              this.zoomWeapon() : 
              this.player.defaultStance(
                time, 
                this.joystick1, 
                this.keys, 
                this.leftStick
              );

            if (this.crouching)
                this.player.crouch();

            if (this.jump)
              this.player.jump();
  
            if (this.shoot)
              this.attack(time);
  
            if (this.shoot === false)
                System.config.audio.stop('automac1000_shot', this.scene);
        });
    }
  
  //---------------------------- inventory menu

    private openMenu (): void 
    {
      // System.config.audio.play('bloop1', 1, false, this.scene, 0);           
      // this.scene.scene.run('Menu3D', this.scene);
    }

  //------------------------------ chat

    private openChatWindow (): void
    {
      // this.scene.input.mouse.releasePointerLock();
      // this.scene.scene.get('Chat')['sendMessage']();
      // this.scene.scene.get('Chat')['toggleChatWindow']();
    }

  //-------------------------------- trigger movement

    private triggerMovement (x: number, y: number): void
    {
      this.player.move(x, y);

      let moveX = this.pointerMoveX !== -1 ? this.pointerMoveX / 5 : 0,
          moveY = this.pointerMoveY !== -1 ? this.pointerMoveY / 5 : 0;

      this.player.look(moveX, moveY, this.firstPersonControls);
    }
  
  //---------------------------------------- zoom

    private zoomWeapon(): void
    {
      //this.crossHairs.alpha = 0
      this.player.movement.x = THREE.MathUtils.lerp(this.player.movement.x, 0.6, 0.2);
      this.player.movement.y = THREE.MathUtils.lerp(this.player.movement.y, -0.8 + 1.8, 0.2);
      this.player.movement.z = THREE.MathUtils.lerp(this.player.movement.z, -0.45, 0.2);
    }
  
  //------------------------------------------- attack
  
    private attack(time: number): void
    {

      let playerWeapon = this.player['currentEquipped']; 

      if (typeof playerWeapon.obj.recoil === 'function' && playerWeapon.quantity >= 1)
        playerWeapon.obj.recoil(time);

      if (/* this.scene.scene.get('Menu3D').scene.settings.active || */ this.isFiring === true)
        return;

      this.isFiring = true;
      this.scene.time.delayedCall(250, ()=> this.isFiring = false);

      this.player.attack();

    }
  
  
  //-------------------------------keyboard
  
    private dumpKeyState(): void
    {
      if (this.gamePadStatus === 1)
        return;

      this.zoom = this.scene.input.mousePointer.rightButtonDown();
      this.shoot = this.scene.input.mousePointer.leftButtonDown();

    //------------- crouch

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

    //------- trigger jump

        this.jump = this.keys.space.isDown ? true : false;


      //------------set to idle

        if (this.keys.w.isUp && this.keys.a.isUp && this.keys.s.isUp && this.keys.d.isUp)
          this.player.idle();
        
        else 
        {

        //forward / back

          if (this.keys.w.isDown)
            this.triggerMovement(0, -41);
          else if (this.keys.s.isDown)
            this.triggerMovement(0, 41);  

        //strafe

          else if (this.keys.a.isDown)
            this.triggerMovement(-41, 0);
          else if (this.keys.d.isDown)
            this.triggerMovement(41, 0);
        }

    }
  
    //--------------------------- virtual joysticks
  
    private dumpVirtualJoyStickState(): void
    {
      if (this.joystick1 !== null)
        this.joystick1.force !== 0 ?
        this.player.move(this.joystick1.forceX, this.joystick1.forceY) : this.player.idle();
      if (this.joystick2 !== null)
        this.firstPersonControls.update(this.joystick2.forceX / 5, this.joystick2.forceY / 5);
      
    }

    //-------------------------------- controller

    private dumpGameControllerState(): void
    {

      let lookSpeed = 5,
          moveSpeed = 100;

      this.leftStick = this.scene.input.gamepad['_pad1'].leftStick;
      this.rightStick = this.scene.input.gamepad['_pad1'].rightStick; 

      this.leftStick !== { x: 0, y: 0 } ? 
        this.player.move(this.leftStick.x * moveSpeed, this.leftStick.y * moveSpeed) : this.player.idle();

      this.firstPersonControls.update(this.rightStick.x * lookSpeed, this.rightStick.y * lookSpeed);

    }

    //---------------------------------- resize

    private resizeWindow(scene: Phaser.Scene | Scene3D): void 
    {

      if (!scene.scene.settings.active)
          return;

      if (System.config.input.type === 'touch')
      {
        if (System.isPortrait(scene)) 
        {
          this.buttonA?.setPosition(40, 500);
          this.buttonB?.setPosition(100, 550);
          this.buttonC?.setPosition(this.scene.scale.width - 100, 550);
          this.buttonD?.setPosition(this.scene.scale.width - 50, 510);
          this.buttonE?.setPosition(this.scene.scale.width - 50, 590);
          this.buttonF?.setPosition(this.scene.scale.width - 150, 590);
          this.joystickBase1?.setPosition(100, 450);
          this.joystickThumb1?.setPosition(100, 450);
          this.joystick1?.setPosition(100, 450); 
          this.joystickBase2?.setPosition(this.scene.scale.width - 50, 450);
          this.joystickThumb2?.setPosition(this.scene.scale.width - 100, 450);
          this.joystick2?.setPosition(this.scene.scale.width - 100, 450);
        }
        else
        {
          this.joystickBase1?.setPosition(100, innerHeight / 2);
          this.joystickThumb1?.setPosition(100, innerHeight / 2);
          this.joystick1?.setPosition(100, innerHeight / 2); 
          this.joystickBase2?.setPosition(this.scene.scale.width - 50, innerHeight / 2);
          this.joystickThumb2?.setPosition(this.scene.scale.width - 100, innerHeight / 2);
          this.joystick2?.setPosition(this.scene.scale.width - 100, innerHeight / 2);
          this.buttonA?.setPosition(40, this.joystick1.y + 100);
          this.buttonB?.setPosition(100, this.joystick1.y + 100);
          this.buttonC?.setPosition(this.scene.scale.width - 100, this.joystick1.y + 100);
          this.buttonD?.setPosition(this.scene.scale.width - 50, this.joystick1.y + 60);
          this.buttonE?.setPosition(this.scene.scale.width - 50, this.joystick1.y + 140);
          this.buttonF?.setPosition(this.scene.scale.width - 150, this.joystick1.y + 140);

        }
      }
    }
  }
  