/* SHOOTING RANGE SKEETSHOOT*/

import * as ENABLE3D from '@enable3d/phaser-extension'

import { Lighting } from './lighting'
import { Game } from './game'
import { AudioManager } from '../internals/Audio'
import { ThirdDimension } from '../internals/ThirdDimension'

export class SkeetShoot extends ENABLE3D.Scene3D {

  private assetCache: string[] = [ 
    'range',  
    'meatball_3d',
    'carrot', 
    'broccoli', 
    'automac1000',
    'sv' 
  ]

  private timeLeft: string
  private score: number = 0 
  private level: number = 1
  private spawns: number = 10
  private _scene: Phaser.Scene 
  private rounds: number 
  private swankyVelvet: ENABLE3D.ExtendedObject3D
  private enemies: ENABLE3D.ExtendedObject3D[] = []

  public gameState: boolean = false

  //---------------------------------- helpers 
 

  public incrementScore(factor: number): void {
    this.score += factor;
  } 

  public setTime(time: number): void {
    this.timeLeft = time.toString();
  }
  
  public get getGameState(): boolean {
    return this.gameState;
  } 

  public get getScore(): string {
    return this.score.toString();
  }

  public get getTime(): string {
    return this.timeLeft;
  }

  public get getLevel(): string {
    return this.level.toString();
  }

  constructor() {
    super({ key: 'SkeetShoot' });
  }  

  private async init([_scene, rounds]): Promise<void>
  {

    this._scene = _scene;
    this.data = _scene.data;
    this.data['currentStage'] = 'SkeetShoot';
    this.rounds = rounds ? rounds : 1;
    this.enemies.length = 0;
    this.gameState = false;
    this.timeLeft = '';

    if (this.level > 1) 
        this.spawns += this.spawns / 2;

    //base weapon is not available in this mini game

    const Inventory3D = (await import ('./inventory/inventoryManager')).Inventory3D; 

    Inventory3D.currentInventory.splice(Inventory3D.currentInventory.indexOf('rolling_pin1', 1));

    //set ammo to unlimited

    Inventory3D.makeUnlimitedAmmo();

  }

  private async create(): Promise<void>
  {

    Game.initWorld(this);

    const { ThirdDimension } = await import ('../internals/ThirdDimension');

    await ThirdDimension.init(this, 3, this.assetCache);  
    await ThirdDimension.create(this, 'range', [0, -60, 0, true, { currentEquipped: 'automac1000' }]);  //apply defaults

    //swanky velvet

    this.swankyVelvet = new (await import ('./Actor')).Actor(this, 'sv', 70, -18, -60, true, true, () => {
      this.swankyVelvet.anims.play('Idle');
      this.swankyVelvet.rotation.set(0, -180, 0); 
      this.swankyVelvet.scale.set(0.12, 0.12, 0.12); 
    });

    this.time.delayedCall(2000, async () => {

      //spawn meatball targets

        for (let i = 0; i < this.spawns; i++)
            this.enemies[i] = new (await import ('./meatball')).Meatball(this, Phaser.Math.Between(-200, 200), Phaser.Math.Between(30, 120), Phaser.Math.Between(-300, -500));

        //format the time and decrement

        (await import (`../internals/Clock`)).Clock.startTimer(this, this.spawns > 10 ? (45000 * (this.level * 0.1 + 1)) : 45000, 'decrement');
        this.gameState = true;

    });
  }


  //----------------------------


  public update (): void
  {

    Game.preUpdate(this);

    //end round

    if (this.score >= this.spawns || this.getTime === '0:00') 
    {
        if (this.getTime === '0:00')
            this.timeLeft = '0:00';

        this.gameOver();
        this.gameState = false;  
    }

  }


  //------------------------------------ game over

  public gameOver(): void
  {

    if (!this.gameState)
      return;

    Game.gameState = false;
    this.rounds--;

    this.swankyVelvet.anims.play('Laugh');

    this.time.addEvent({
        delay: 3000, callback: () => this.swankyVelvet.anims.play(this.swankyVelvet.anims.current === 'Laugh' ? 'Jump' : 'Laugh'), 
        callbackScope: this, 
        repeat: -1
      }
    );

    AudioManager.play('airhorn', 1, false, this, 0);

    Lighting.setCreepyLighting(this, -10);

    if (this.score === this.spawns) 
    {
        if (this.scene.manager.getScene('Alerts')) 
            this.scene.get('Alerts')['alert']('large', 'YOU WIN!!!!', '$50 dough!');  
    }

    else
        this.time.delayedCall(2000, () => {   
    
            if (this.scene.manager.getScene('Alerts')) 
                this.scene.get('Alerts')['alert']('large', 'YOU LOSE!!!!');

            this.time.delayedCall(4000, async () => {

                //cleanup objects

                await ThirdDimension.reset(this);

                this.score === this.spawns ? 
                this.level++ : this.level = 1;

                this.score = 0;

                this.sound.stopAll(); 
                this.sound.removeAll();

                this.scene.restart([this._scene, this.level]);
            });  

            this.level = 1;
            this.spawns = 10;
            this.score = 0;

        });

  }

}








      
