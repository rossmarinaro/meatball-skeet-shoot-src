import * as ENABLE3D from '@enable3d/phaser-extension'
import { System } from '../internals/Config'
import { Player3D } from './player'
import { ThirdDimension } from '../internals/ThirdDimension'
import { LevelManager3D } from './levelManager'
import { Inventory3D } from '../game/inventory/inventoryManager'
import { AudioManager } from '../internals/Audio'

export class Controller3D {
 
  private scene: ENABLE3D.Scene3D
  private player: Player3D
  private gamePadStatus: number
  private isIdle: boolean
  private zoom: boolean
  private shoot: boolean
  private move: boolean
  private isFiring: boolean
  private crouching: boolean
  private jump: boolean
  private keys: any
  private joystick1: any
  private joystick2: any
  private rightStick: any
  private leftStick: any
  private buttonA: Phaser.GameObjects.Arc | null
  private buttonB: Phaser.GameObjects.Arc | null
  private buttonC: Phaser.GameObjects.Arc | null
  private buttonD: Phaser.GameObjects.Arc | null
  private buttonE: Phaser.GameObjects.Arc | null
  private buttonF: Phaser.GameObjects.Arc | null
  private buttonG: Phaser.GameObjects.Arc | null
  private joystickBase1: Phaser.GameObjects.Arc | null
  private joystickBase2: Phaser.GameObjects.Arc
  private joystickThumb1: Phaser.GameObjects.Arc
  private joystickThumb2: Phaser.GameObjects.Arc
  private mic: Phaser.GameObjects.Sprite

  public pauseInputs: boolean
  public left: boolean
  public right: boolean
  public down: boolean
  public up: boolean
  public action: boolean

  public perspectiveControls: {
    type: string
    camera: {
      first: ENABLE3D.FirstPersonControls
      third: ENABLE3D.ThirdPersonControls
    }
    update: Function
    setCameraOffset: Function
  } 


  //---------------------------------------- constructor


    constructor(scene: ENABLE3D.Scene3D)
    {
      this.scene = scene;
      this.gamePadStatus = 0;
      this.isIdle = true;
      this.zoom = false;
      this.move = false;
      this.shoot = false;
      this.isFiring = false;
      this.pauseInputs = false;
      this.joystick1 = null;
      this.joystick2 = null;

    }


  //------------------------------- initialize controls


    public init(player?: Player3D): void
    {

      if (player)
        this.player = player;

      let timeToIdle: Phaser.Time.TimerEvent,
          freeCamdir = false,
          isFreeCam = false;

      const copyVec = new ENABLE3D.THREE.Vector3, 
            lookAtVec = new ENABLE3D.THREE.Vector3,
      
      idleCB = (timer: Phaser.Time.TimerEvent) => {

            if (!this.isIdle) {
              isFreeCam = false;
              timer.reset(idleTimerConfig);
            }
            else {
                freeCamdir = Math.floor(Math.random() * 10) + 1 > 5; 
                isFreeCam = true;
            } 
          },

          idleTimerConfig = { startAt: 0, delay: 10000, repeat: -1, callback: () => idleCB(timeToIdle) };
          timeToIdle = this.scene.time.addEvent(idleTimerConfig);

      //first / third person perspective controls object OR second perspective for 2d
  
      this.perspectiveControls = {

        type: 'third',
        camera: {
          first: new ENABLE3D.FirstPersonControls(this.scene.third.camera, this.player, { targetRadius: 0 }),
          third: new ENABLE3D.ThirdPersonControls(this.scene.third.camera, this.player, { targetRadius: 30 })
        },

        setCameraOffset: (camera: ENABLE3D.FirstPersonControls | ENABLE3D.ThirdPersonControls): void => {    
          
          if (ThirdDimension.camType === 2)
            return;

          if (!this.player.raycaster || !this.scene.third)
            return;
            
          const direction = this.scene.third.camera.getWorldDirection(this.player.raycaster.ray.direction),
            
                bounds = LevelManager3D.bounds,
            
                zoomFactor = !bounds ? 50 : 
                       (this.player.position.x >= bounds.left || this.player.position.x <= bounds.right) ||
                       (this.player.position.z >= bounds.top || this.player.position.z <= bounds.bottom) ? 
                        5 : 50;

            camera.offset.set(

              this.perspectiveControls?.type === 'third' ? -direction.normalize().x * zoomFactor : 0, 
              15,
              this.perspectiveControls?.type === 'third' ? -direction.normalize().z * zoomFactor : 0
            );   
        },

        update: (x: number, y: number): void => {  

          if (!this.isIdle) {
            isFreeCam = false;
            timeToIdle.reset(idleTimerConfig);
          }

          //"2d" camera
          
          if (ThirdDimension.camType === 2 && this.scene.third) {

            this.scene.third.camera.position.copy(copyVec.set(this.player.position.x, this.player.position.y + 20, this.player.position.z + 130));
            this.scene.third.camera.lookAt(lookAtVec.set(this.player.position.x, this.player.position.y - 5, this.player.position.z));

            return;
          }

        //standard 3d camera

        //set respective offsets

          this.perspectiveControls.camera.first.offset = new ENABLE3D.THREE.Vector3;
          this.perspectiveControls.camera.third.offset = new ENABLE3D.THREE.Vector3;

          this.perspectiveControls.setCameraOffset(this.perspectiveControls.camera.first);
          this.perspectiveControls.setCameraOffset(this.perspectiveControls.camera.third);

        //update perspective cameras, free-cam rotation occurs on idle when menus are closed, and in third person view

          const notPaused = this.scene.scene.manager.getScene('Menu3D') ? !this.scene.scene.get("Menu3D").scene.settings.active : true;
 
          this.perspectiveControls.camera.third.update(isFreeCam && this.perspectiveControls.type === 'third' && notPaused ? freeCamdir ? x += 3 : x -= 3 : x, y);
          this.perspectiveControls.camera.first.update(x, y);

        } 

      }

      //virtual controls
      
      if (System.Config.mobileAndTabletCheck()) 
      {

        const joystickPlugin = this.scene.plugins.get('rexvirtualjoystickplugin');
        
        this.scene.input.addPointer(1);

        this.joystickBase1 = this.scene.add.circle(100, 450, 50, 0x000000).setAlpha(0.5);
        this.joystickThumb1 = this.scene.add.circle(100, 450, 30, 0xcccccc).setAlpha(0.5);
        this.joystick1 = joystickPlugin && joystickPlugin['add'](this.scene, {
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
        this.joystick2 = joystickPlugin && joystickPlugin['add'](this.scene, {
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
            .on('pointerdown', () => {
            if (!this.pauseInputs)
                this.openMenu();
            });

        this.buttonB = this.scene.add.circle(100, 550, 20, 0x000000).setAlpha(0.5)
            .setInteractive()
            .on('pointerdown', () => this.shoot = true)
            .on('pointerup', () => this.shoot = false)
            .on('pointerout', () => this.shoot = false);

        this.buttonC = this.scene.add.circle(this.scene.scale.width - 100, 550, 20, 0x000000).setAlpha(0.5)
            .setInteractive()
            .on('pointerdown', () => this.zoom = true)
            .on('pointerup', () => this.zoom = false)
            .on('pointerout', () => this.zoom = false);

        this.buttonD = this.scene.add.circle(this.scene.scale.width - 50, 510, 20, 0x000000).setAlpha(0.5)
            .setInteractive()
            .on('pointerdown', () => Inventory3D.cycleInventory(this.scene, 1))

        this.buttonE = this.scene.add.circle(this.scene.scale.width - 50, 590, 20, 0x000000).setAlpha(0.5)
            .setInteractive()
            .on('pointerdown', () => this.jump = true)
            .on('pointerup', () => this.jump = false)
            .on('pointerout', () => this.jump = false);

        this.buttonG = this.scene.add.circle(40, 590, 20, 0x000000).setAlpha(0.5)
            .setInteractive()
            .on('pointerdown', () => {
            if (!this.pauseInputs)
                this.togglePerspectiveCamera();
            }); 

      }

      //---------------------- keyboard

      else 
      {
        this.keys = {
          w: this.scene.input.keyboard?.addKey('w', false),
          a: this.scene.input.keyboard?.addKey('a', false),
          s: this.scene.input.keyboard?.addKey('s', false),
          d: this.scene.input.keyboard?.addKey('d', false),
          q: this.scene.input.keyboard?.addKey('q', false),
          e: this.scene.input.keyboard?.addKey('e', false),
          v: this.scene.input.keyboard?.addKey('v', false),
          space: this.scene.input.keyboard?.addKey('space', false)
        }
  
      //trigger inventory menu
          
        this.scene.input.keyboard?.on('keydown-TAB', this.openChatWindow, this)

      //open chat window

          .on('keydown-CTRL', this.openMenu, this)

      //toggle camera first / third person perspective

          .on('keydown-SHIFT', this.togglePerspectiveCamera, this)

      //lock the pointer and update the first person control

        this.scene.input
      
          .on('pointerdown', () => {

            if (
              (!this.scene.scene.manager.getScene('Menu3D') || !this.scene.scene.get('Menu3D').scene.settings.active) && 
              (!this.scene.scene.manager.getScene('Modal') || !this.scene.scene.get('Modal').scene.settings.active)
            )
              this.scene.input.mouse?.requestPointerLock();
          })

          .on('pointermove', (pointer: Phaser.Input.Pointer): void => {

                if (this.scene.input.mouse?.locked && pointer)
                { 
        
                    if (!this.move) {
                        this.isIdle = false;
                        this.scene.time.delayedCall(idleTimerConfig.delay, () => this.isIdle = true);
                    }

                    this.perspectiveControls.update(pointer.movementX, pointer.movementY);
                
                }
            })

          //scroll inventory

          .on('wheel', (pointer: Object, x: any, y: number, z: number, event: number) => Inventory3D.cycleInventory(this.scene, z));
      }

      //-------------------------gamepad

        this.scene.input.gamepad?.on('down', (pad: any, button: any, status: number): void => { 

          this.gamePadStatus = status;

          if (this.scene.scene.get('Survival').scene.isActive())
          {
            this.left = true;
            this.right = true;
            return;
          }

          if (button.index === 9) //start
            this.openMenu();

          if (button.index === 8) //select
            this.openChatWindow();

          if (pad.R1 || pad.R2) 
            this.shoot = true;

          if (pad.A)
            Inventory3D.cycleInventory(this.scene, 1);

          if (pad.B) 
            this.jump = true;

          if (pad.Y) 
            this.zoom = true;

          if (pad.X) 
            this.crouching = true;
        })
        .on('up', (pad: any, button: any, status: number) => { 

            this.gamePadStatus = status;

            if (this.scene.scene.get('Survival').scene.isActive())
            {
              this.left = false;
              this.right = false;
              return;
            }

            this.shoot = false;
            this.jump = false;
            this.crouching = false;
            this.zoom = false;
        });
          
  
    //------------------------------------------------- on scene update
  
        this.scene.events.on('update', (time: number, delta: number) => {

  
        //update depending on device / controller, keyboard input

          if (this.player !== null && this.player.initialized && this.scene.scene.isActive())
          {

            this.resizeWindow(this.scene);

            this.perspectiveControls.update(0, 0);

            System.Process.app.input.type === 'touch' ? 
                this.dumpVirtualJoyStickState() : this.dumpKeyState();

            if (this.scene.input.gamepad && this.scene.input.gamepad['_pad1'])
                this.dumpGameControllerState(); 
              
            this.zoom ? 
              this.zoomWeapon() : this.player.defaultStance(time, this.joystick1, this.keys, this.leftStick);

            if (this.crouching)
                this.player.crouch();

            if (this.jump)
              this.player.jump();
  
            if (this.shoot)
              this.attack(time);
  
            if (!this.shoot)
              AudioManager.stop('automac1000_shot', this.scene);
              
          }
        });
    }
  

  //---------------------------- inventory menu


    private async openMenu (): Promise<void>
    {
        // AudioManager.play('bloop1', 1, false, this.scene, 0);   
        
        // if (this.scene.scene.manager.getScene('Menu3D') && this.scene.scene.get('Menu3D').scene.settings.active) {
        //     this.pauseInputs = false;
        //     this.scene.scene.stop('Menu3D');
        // }

        // else 
        // {
        //     if (!this.scene.scene.manager.getScene('Menu3D')) {
        //         const { Menu3D } = await import('./menu');
        //         this.scene.scene.manager.add('Menu3D', Menu3D); 
        //     }
            
        //     this.scene.scene.run('Menu3D', this.scene);
        //     this.pauseInputs = true;
        // }
    } 


  //------------------------------ chat


    private openChatWindow (): void
    {
        if (this.scene.scene.manager.getScene('Menu3D') && this.scene.scene.get('Menu3D').scene.settings.active)
            return;

        this.scene.input.mouse?.releasePointerLock();
        
        this.scene.scene.get('Chat')['sendMessage']();
        this.scene.scene.get('Chat')['toggleChatWindow']();
    }


  //-------------------------------- toggle perspective


    private togglePerspectiveCamera(): void
    {
        if (ThirdDimension.camType === 2) {
            this.perspectiveControls.type = 'third';
            return;
        }

        const camera = this.perspectiveControls.type === 'third' ? 
            this.perspectiveControls.camera.first : 
            this.perspectiveControls.camera.third;
        
        //set current camera (first, third)

        this.perspectiveControls.type = camera === this.perspectiveControls.camera.first ? 'first' : 'third';
    }


  //---------------------------------------- zoom


    private zoomWeapon(): void
    {
        const currentEquipped = this.player['currentEquipped'].obj;
        
        if (!currentEquipped)
            return;

        this.player.movement.x = ENABLE3D.THREE.MathUtils.lerp(this.player.movement.x - currentEquipped.zoom.x, currentEquipped.zoom.y, 0.2);
        this.player.movement.y = ENABLE3D.THREE.MathUtils.lerp(this.player.movement.y, 1, 0.2);
        this.player.movement.z = ENABLE3D.THREE.MathUtils.lerp(this.player.movement.z, -0.45, 0.2);
    }
  

  //------------------------------------------- attack

  
    private attack(time: number): void
    {
        const playerWeapon = this.player['currentEquipped']; 

        if (!playerWeapon.obj)
            return;

        if (
            playerWeapon.quantity >= 1 &&
            (System.Config.isDesktop(this.scene) && this.scene.input.mouse?.locked) ||
            System.Config.mobileAndTabletCheck()
        )
            playerWeapon.obj.recoil(time); 

        if ((this.scene.scene.manager.getScene('Menu3D') && this.scene.scene.get('Menu3D').scene.settings.active) || this.isFiring)
            return;

        this.isFiring = true;
        this.isIdle = false;
        this.scene.time.delayedCall(250, () => this.isFiring = false);

        this.player.attack();
    }
  
  
  //------------------------------- keyboard

  
    private dumpKeyState(): void
    {
        if (this.gamePadStatus === 1)
            return;

        this.zoom = this.scene.input.mousePointer?.rightButtonDown();
        this.shoot = this.scene.input.mousePointer?.leftButtonDown();

        if (!this.keys)
            return;

      //crouch

        if (this.keys.q.isDown) {
          this.crouching = true; 
          //this.scene.third.camera.rotateZ(0.2);
          //this.perspectiveControls.offset = new THREE.Vector3(Math.sin(this.theta + Math.PI * 0.5) * 0.4, 0, Math.cos(this.theta + Math.PI * 0.5) * 0.4);
        }

        else if (this.keys.e.isDown) {
          this.crouching = false;
          //this.scene.third.camera.rotateZ(-0.2);
          //this.perspectiveControls.offset = new THREE.Vector3(Math.sin(this.theta - Math.PI * 0.5) * 0.4, 0, Math.cos(this.theta - Math.PI * 0.5) * 0.4);
        }
        
      //trigger jump

        this.jump = this.keys.space.isDown ? true : false;

      //set to idle

        if (this.keys.w.isUp && this.keys.a.isUp && this.keys.s.isUp && this.keys.d.isUp) {
          this.isIdle = true;
          this.move = false;
          this.player.idle();
        }

        else 
        {

          this.isIdle = false;
          this.move = true;

        //forward / back

          if (this.keys.w.isDown) 
            this.player.move(0, -41);

          else if (this.keys.s.isDown) 
            this.player.move(0, 41);  

        //strafe

          else if (this.keys.a.isDown) 
            this.player.move(-41, 0);
            
          else if (this.keys.d.isDown) 
            this.player.move(41, 0);
        }

    }
  
    //--------------------------- virtual joysticks

  
    private dumpVirtualJoyStickState(): void
    {

        if (this.joystick1 !== null && this.joystick2 !== null)
        {

            if (this.joystick1.force !== 0) {
                this.isIdle = false;
                this.move = true;
                this.player.move(this.joystick1.forceX, this.joystick1.forceY)
            }

            else 
                this.player.idle();

            if (this.joystick2.force !== 0) {
                this.isIdle = false;
                this.move = true;
            }

            if (this.joystick1.force === 0 && this.joystick2.force === 0) {
                this.isIdle = true;
                this.move = false;
            }
            
       
            this.perspectiveControls.update(this.joystick2.forceX / 10, this.joystick2.forceY / 10);
        }
    
    }

    //-------------------------------- controller


    private dumpGameControllerState(): void
    {

      let lookSpeed = 5,
          moveSpeed = 100;

      this.leftStick = this.scene.input.gamepad && this.scene.input.gamepad['_pad1'].leftStick;
      this.rightStick = this.scene.input.gamepad && this.scene.input.gamepad['_pad1'].rightStick; 

      if (this.leftStick.x !== 0 && this.leftStick.y !== 0)
      {
        this.isIdle = false;
        this.move = true;
        this.player.move(this.leftStick.x * moveSpeed, this.leftStick.y * moveSpeed);
      } 
      
      else 
        this.player.idle();

      if (this.rightStick.x === 0 && this.rightStick.y === 0) {
        this.isIdle = true;
        this.move = false;
        
      }

      this.perspectiveControls.update(this.rightStick.x * lookSpeed, this.rightStick.y * lookSpeed);

    }

    //---------------------------------- resize
    

    private resizeWindow(scene: Phaser.Scene | ENABLE3D.Scene3D): void 
    {

      if (!scene.scene.settings.active)
          return;

      if (System.Process.app.input.type === 'touch')
      
        setTimeout(() => {

          this.mic?.setPosition(this.scene.scale.width - 50, this.scene.scale.height - 50);
          
          if (ThirdDimension.camType === 2) //"2d"
          {

            if (System.Config.isPortrait(scene)) 
            {

              this.buttonA?.setPosition(40, 500);
              this.buttonB?.setPosition(100, 550);
              this.buttonC?.setPosition(this.scene.scale.width - 100, 550);
              this.buttonD?.setPosition(80, 450);
              this.buttonE?.setPosition(this.scene.scale.width - 50, 590);
            }

            else
            {

              this.buttonA?.setPosition(40, innerHeight / 2 + 100);
              this.buttonB?.setPosition(100, innerHeight / 2 + 100);
              this.buttonC?.setPosition(this.scene.scale.width - 100, innerHeight / 2 + 100);
              this.buttonD?.setPosition(70, innerHeight / 2 + 40);
              this.buttonE?.setPosition(this.scene.scale.width - 50, innerHeight / 2 + 140);
            }
          }

          else //standard 3d
          {

            if (System.Config.isPortrait(scene)) 
            {

              this.buttonA?.setPosition(40, 500);
              this.buttonB?.setPosition(100, 550);
              this.buttonC?.setPosition(this.scene.scale.width - 100, 550);
              this.buttonD?.setPosition(this.scene.scale.width - 50, 510);
              this.buttonE?.setPosition(this.scene.scale.width - 50, 590);
              this.buttonF?.setPosition(this.scene.scale.width - 150, 590);
              this.buttonG?.setPosition(40, 590);
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
              this.buttonG?.setPosition(70, this.joystick1.y + 140);
            }
          }
          
        }, 1000);
      
    }
  }
  