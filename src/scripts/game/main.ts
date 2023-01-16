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

  public meatballs: Meatball[] = []

  private _scene: Phaser.Scene
  private swankyVelvet: ENABLE3D.ExtendedObject3D

  constructor() {
    super({ key: 'SkeetShoot' });
  }

  private init([scene, rounds]): void
  {

   this._scene = scene;
   this.rounds = rounds;
   this.timeLeft = 1000.000;
   this.score = 0;

   this.data['currentStage'] = 'SkeetShoot';

   System.Process.app.ThirdDimension.init(this, 10, 10, -10);  
   System.Process.app.ThirdDimension.Inventory3D.ammo.automac1000 = Infinity;

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

      await Meatball.spawn(this, this.meatballs);

    //swanky velvet

      this.swankyVelvet = new Actor(this, 'sv', true, true, ()=> {
        this.swankyVelvet.anims.play('Idle');
        this.swankyVelvet.position.set(70, -20, -60);
        this.swankyVelvet.rotation.set(0, -180, 0);
        this.swankyVelvet.scale.set(0.12, 0.12, 0.12);
      });


  }

  //------------------------------------

  public gameOver(): void
  {

    this.swankyVelvet.anims.play('Laugh');

    this.time.addEvent(
      {
        delay: 5000, callback: ()=> this.swankyVelvet.anims.play(this.swankyVelvet.anims.current === 'Laugh' ? 
        'Jump' : 'Laugh'), 
        callbackScope: this, 
        repeat: -1
      }
    );

    this.third.camera.lookAt(0, 0, 0);
    System.Process.app.audio.play('airhorn', 1, false, this, 0); 

    this.time.delayedCall(4000, () => this._scene.scene.restart([this._scene, 1]));
  }


}







      
