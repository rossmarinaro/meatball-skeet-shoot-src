/* SHOOTING RANGE */
import { AnimationClip } from 'three';
import { Scene3D, ExtendedObject3D } from '@enable3d/phaser-extension';
import { System } from '../internals/Config'
import { Inventory3D } from './inventory';
import { Lighting } from './lighting';
import { Meatball } from './meatball';
import { Player } from './player';
import { HUD } from './hud';
import { Controller } from './controller';
import { Level } from './level';



//------------------------------------------------ MAIN


export class TargetPractice extends Scene3D {

  public rounds: number
  public timeElapsed: number
  public timeLeft: number
  public score: number
  private _scene: Phaser.Scene
  public lighting: Lighting
  public level: Level
  public player: Player
  public hud: HUD
  public controller: Controller
  public entities: Player[]
  public meatballs: Meatball[] = []

  private gameState: boolean
  private swankyVelvet: ExtendedObject3D
  private swankymations: string[]

  constructor() {
    super({ key: 'TargetPractice' });
  }

  public init([scene, rounds])
  {

   this.gameState = true;
   this._scene = scene;
   this.rounds = rounds;
   this.timeLeft = 60.000;
   this.score = 0;
   this._scene.data['currentStage'] = 'shooting range';
   this.data['weapons'] = ['automac1000'];
   this.data['items'] = [];
   this.data['powerups'] = [];
   Inventory3D.ammo.automac1000 = Infinity;

   System.config.audio.music.play(this._scene);
   scene.scene.stop('Background');

    this.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 });
    //this.third.physics.debug?.enable();    

  }

  //----------------------------------------------------

  public async preload()
  { 
    await this._scene.scene.get('Preload')['preload3D'](this._scene, this);
  }

  //---------------------------------------------------

  public async create()
  {

    //this.renderer.clear()

      this.lighting = new Lighting(this);
      this.level = new Level(this);

    //load map before objects
      await this.level.load();

      this.player = new Player(this);
      this.hud = new HUD(this, 'SkeetShoot');
      this.controller = new Controller(this, this.player);

      Inventory3D.setItem(this, 'automac1000');

    //entities
      this.entities = [this.player];

      //spawn meatball targets

        await Meatball.spawn(this, this.meatballs);


      //swanky velvet

        this.swankyVelvet = new ExtendedObject3D();
   
        this.third.load.fbx('sv').then((obj: any) => {

          this.swankyVelvet.add(obj); 

          for (let i in obj.animations) 
            this.swankyVelvet.anims.add(obj.animations[i].name, obj.animations[i]);
            
          obj.animations.forEach((i: AnimationClip) => {

          });

          this.third.animationMixers.add(this.swankyVelvet.anims.mixer);  

          this.swankyVelvet.anims.play('Idle');

            this.swankyVelvet.traverse((i: any) => {
              if (i.isMesh)
              {
                i.castShadow = i.receiveShadow = true;
                if (i.material)
                {
                  i.material.metalness = 0.3;
                  i.material.roughness = 0.3;
                }
              }
            })
    
          this.swankyVelvet.position.set(70, -20, -60);
          this.swankyVelvet.rotation.set(0, -180, 0);
          this.swankyVelvet.scale.set(0.12, 0.12, 0.12);
 
          this.third.add.existing(this.swankyVelvet);
   
    
        });
  }

  //---------------------------------------------------

  public async update(time: number): Promise<void>
  {

      //this.timeElapsed = time;

    for (let entity in this.entities)
      if (typeof this.entities[entity].update === 'function')
        this.entities[entity].update(time);

  //spawn more meatballs if empty array

    if (this.meatballs.length <= 0 && this.gameState)
      await Meatball.spawn(this, this.meatballs);

  }

  //---------------------------------------------------

  public gameOver(): void
  {

    this.gameState = false;

    this.swankyVelvet.anims.play('Laugh');
    this.time.addEvent(
      {delay: 5000, callback: ()=> this.swankyVelvet.anims.play(this.swankyVelvet.anims.current === 'Laugh' ? 
      'Jump' : 'Laugh'), callbackScope: this, repeat: -1
      }
    );
    this.third.camera.lookAt(0, 0, 0);
    System.config.audio.play('airhorn', 1, false, this, 0); 

  }


}







      
