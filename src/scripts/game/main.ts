/* SHOOTING RANGE */

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config'
import { Meatball } from './meatball';
import { Actor } from '../game/Actor';
import { Clock } from '../internals/Clock';


export class SkeetShoot extends ENABLE3D.Scene3D {

  public rounds: number = 1
  public timeLeft: string

  private _scene: Phaser.Scene 
  private swankyVelvet: ENABLE3D.ExtendedObject3D
  private enemies: Meatball[] = []

  private assetCache: string[] = [ 
    'range', 
    'carrot', 
    'broccoli', 
    'sv',
    'meatball_3d'
  ]

  public static gameState: boolean = false
  private static score: number = 0
  private static level: number = 1
  private static spawns: number = 10

  constructor() {
    super({ key: 'SkeetShoot' });
  }

  private init([_scene, rounds]): void
  {

   this._scene = _scene;
   this.rounds = rounds;
   this.data['currentStage'] = 'SkeetShoot';
   this.enemies = [];

   if (SkeetShoot.level > 1)
    SkeetShoot.spawns += SkeetShoot.spawns / 2;


  }

  private async create(): Promise<void>
  {

    System.Process.app.game.init(this);

    await System.Process.app.ThirdDimension.init(this, new ENABLE3D.THREE.Vector3(10, 10, -10), this.assetCache);  
    await System.Process.app.ThirdDimension.create(this, 'range', [0, 0, 0, true, { currentEquipped: 'automac1000' }]);  //apply defaults

    System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 = Infinity;

    //swanky velvet

    this.swankyVelvet = new Actor(this, 'sv', 70, -18, -60, true, true, ()=> {
      
      this.swankyVelvet.anims.play('Idle');
      this.swankyVelvet.rotation.set(0, -180, 0);
      this.swankyVelvet.scale.set(0.12, 0.12, 0.12);

    });

    
    //spawn meatball targets

    this.time.delayedCall(700, () => {

      for (let i = 0; i < SkeetShoot.spawns; i++)
        this.enemies[i] = new Meatball(
                              this, 
                              Phaser.Math.Between(-200, 200), 
                              Phaser.Math.Between(30, 120), 
                              Phaser.Math.Between(-300, -500)
                            );

      //format the time and decrement

      Clock.decrementTime(this, SkeetShoot.spawns > 10 ? 30000 * 1.25 : 30000);

    });

    SkeetShoot.gameState = true;
  }

  //----------------------------


  public update (): void
  {
    if (SkeetShoot.score >= SkeetShoot.spawns || this.timeLeft === '0:00')
      SkeetShoot.gameState = false; //you win
  }


  //----------------------------------

  
  public setTime(factor: string): void
  {
    this.timeLeft = factor;
  }

  
  //---------------------------------

  public static incrementScore(): void
  {
    SkeetShoot.score++;
  } 

  //---------------------------------

  
  public static getGameState(): boolean
  {
    return SkeetShoot.gameState;
  } 

  //----------------------------------

  public static getScore(): string
  {
    return SkeetShoot.score.toString();
  }

  //----------------------------------

  public static getLevel(): string
  {
    return SkeetShoot.level.toString();
  }


  //------------------------------------ game over

  public gameOver(): void
  {

    if (!SkeetShoot.gameState)
      return;

    SkeetShoot.gameState = false;

    this.swankyVelvet.anims.play('Laugh');
    this.time.addEvent(
      {
        delay: 3000, callback: ()=> this.swankyVelvet.anims.play(this.swankyVelvet.anims.current === 'Laugh' ? 
        'Jump' : 'Laugh'), 
        callbackScope: this, 
        repeat: -1
      }
    );

    System.Process.app.audio.play('airhorn', 1, false, this, 0);
    System.Process.app.ThirdDimension.Lighting.setCreepyLighting(this);

    this.time.delayedCall(3000, () => {   

      const alert = this.scene.get('Alerts');

      alert['alert']('large', `YOU ${SkeetShoot.score === SkeetShoot.spawns ? 'WIN' : 'LOSE'}!!!!`);

      this.time.delayedCall(4000, () => {

        //cleanup objects

        System.Process.app.ThirdDimension.reset(this);

        SkeetShoot.score === SkeetShoot.spawns ? 
          SkeetShoot.level++ : SkeetShoot.level = 1;

        SkeetShoot.score = 0;

        this.sound.stopAll(); 
        this.sound.removeAll();

        this.scene.restart([this._scene, SkeetShoot.level]);
      }); 
    });

  }

}







      
