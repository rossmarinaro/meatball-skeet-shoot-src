/* SHOOTING RANGE */

import * as ENABLE3D from '@enable3d/phaser-extension';

import { System } from '../internals/Config'

import { Meatball } from './meatball';
import { Actor } from '../game/Actor';



//------------------------------------------------ MAIN


export class SkeetShoot extends ENABLE3D.Scene3D {

  public rounds: number
  public timeElapsed: number
  public timeLeft: number
  public score: number

  private _scene: Phaser.Scene
  private swankyVelvet: ENABLE3D.ExtendedObject3D
  private meatballs: Meatball[] = []

  constructor() {
    super({ key: 'SkeetShoot' });
  }

  private init([scene, rounds]): void
  {

   this._scene = scene;
   this.rounds = rounds;
   this.timeLeft = 35.000;
   this.score = 0;

   this.data['currentStage'] = 'SkeetShoot';

   System.Process.app.ThirdDimension.init(this, 10, 10, -10);  
   System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 = Infinity;
   this.meatballs = [];

  }
  private async preload(): Promise<void>
  { 
    await this._scene.scene.get('Preload')['preload3D'](this._scene, this);
  }
  private async create(): Promise<void>
  {

    System.Process.app.game.init(this);

    System.Process.app.ThirdDimension.create(this, 'room', [0, 0, 0, true, { currentEquipped: 'automac1000' }]);  //apply defaults

    //spawn meatball targets

    this.spawnMeatballs(10);

    //swanky velvet

      this.swankyVelvet = new Actor(this, 'sv', 70, -18, -60, true, true, ()=> {
        
        this.swankyVelvet.anims.play('Idle');
        this.swankyVelvet.rotation.set(0, -180, 0);
        this.swankyVelvet.scale.set(0.12, 0.12, 0.12);
 
      });


  }

  public update (): void
  {
    if (this.score >= 10)
      this.timeLeft = 0; //you win
  }

  private spawnMeatballs (spawns: number): void
  {
    for (let i = 0; i < spawns; i++)
    {

      let x = Phaser.Math.Between(-200, 200),
          y = Phaser.Math.Between(30, 120),
          z = Phaser.Math.Between(-300, -500);

      this.meatballs.push(new Meatball(this, x, y, z)); 

    }
  }


  //------------------------------------ game over

  public gameOver(): void
  {

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

    this.time.delayedCall(3000, () => {   

      this['hud'].alert('large', `YOU ${this.score === 10 ? 'WIN' : 'LOSE'}!!!!`);

      this.time.delayedCall(4000, () => {
        this.sound.stopAll(); 
        this.sound.removeAll();
        this.scene.restart([this._scene, 1]);
      }); 
    });

  }


}







      
