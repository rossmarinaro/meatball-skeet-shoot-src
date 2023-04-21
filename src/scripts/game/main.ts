/* SHOOTING RANGE */

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config'
import { Meatball } from './meatball';
import { Actor } from '../game/Actor';


export class SkeetShoot extends ENABLE3D.Scene3D {

  public rounds: number = 1
  public timeLeft: number = 30.000

  private __scene: Phaser.Scene 
  private swankyVelvet: ENABLE3D.ExtendedObject3D
  private enemies: Meatball[] = []

  public static loaded: boolean = false
  public static gameState: boolean = false
  private static score: number = 0
  private static level: number = 1
  private static spawns: number = 10

  constructor() {
    super({ key: 'SkeetShoot' });
  }

  private init([__scene, rounds]): void
  {

   this.__scene = __scene;
   this.rounds = rounds;
   this.data['currentStage'] = 'SkeetShoot';
   this.enemies = [];

   if (SkeetShoot.level > 1)
    SkeetShoot.spawns += SkeetShoot.spawns / 2;

   if (SkeetShoot.spawns > 10) 
     this.timeLeft = this.timeLeft * 1.25; 

  }

  private async create(): Promise<void>
  {

    SkeetShoot.gameState = true;

    System.Process.app.game.init(this);

    await System.Process.app.ThirdDimension.init(this, 10, 10, -10);  
    await System.Process.app.ThirdDimension.create(this, 'room', [0, 0, 0, true, { currentEquipped: 'automac1000' }]);  //apply defaults

    System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 = Infinity;

    //spawn meatball targets

    for (let i = 0; i < SkeetShoot.spawns; i++)
    {

      let x = Phaser.Math.Between(-200, 200),
          y = Phaser.Math.Between(30, 120),
          z = Phaser.Math.Between(-300, -500);

      this.enemies.push(new Meatball(this, x, y, z)); 

    }

    //swanky velvet

    this.swankyVelvet = new Actor(this, 'sv', 70, -18, -60, true, true, ()=> {
      
      this.swankyVelvet.anims.play('Idle');
      this.swankyVelvet.rotation.set(0, -180, 0);
      this.swankyVelvet.scale.set(0.12, 0.12, 0.12);

    });


  }

  //----------------------------


  public update (): void
  {
    if (SkeetShoot.score >= SkeetShoot.spawns)
      SkeetShoot.gameState = false; //you win
  }


  //----------------------------------

  public static incrementScore(): void
  {
    SkeetShoot.score++;
  } 

  
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

    SkeetShoot.gameState = false;
    this.timeLeft = 30.000;

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

      this.scene.get('HUD3D')['alert']('large', `YOU ${SkeetShoot.score === SkeetShoot.spawns ? 'WIN' : 'LOSE'}!!!!`);

      this.time.delayedCall(4000, () => {

        //cleanup objects

        System.Process.app.ThirdDimension.reset(this);

        SkeetShoot.score === SkeetShoot.spawns ? 
          SkeetShoot.level++ : SkeetShoot.level = 1;

        SkeetShoot.score = 0;

        this.sound.stopAll(); 
        this.sound.removeAll();

        this.scene.restart([this.__scene, SkeetShoot.level]);
      }); 
    });

  }


}







      
