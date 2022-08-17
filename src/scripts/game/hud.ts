//------------------------------------------------- HUD

import { System } from '../internals/Config';

export class HUD {

  private scene: Phaser.Scene | any
  private initialized: boolean = false;
  private type: string
  private crossHairs: {}
  private timeText: Phaser.GameObjects.Text
  private scoreText: Phaser.GameObjects.Text
  private healthText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, HUDType: string)
    {
        this.type = HUDType;
        this.scene = scene;
        this._init();
    }

    private _init(): void
    {
  
    //------------- UI
  
      ////current weapon
      //this.scene.add.sprite(200, 200, 'automac1000_thumbnail').setAlpha(0.3);
      //this.add.graphics({fillStyle: {color: 0xB50003, alpha: 0.2}}).fillRoundedRect(10, 5, 340, 170, 20);
  
        this.crossHairs = {
            _1: this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 50, 2, 0x000000),
            _2: this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 2, 50, 0x000000)
        }
        
        switch (this.type)
        {
          case 'SkeetShoot': this.initSkeetShoot(); break;
          case 'DeathMatch': this.initMultiplayer(); break;
        }
        this.initialized = true;

        let gameOver = false;

      //----------- on scene update
  
          this.scene.events.on('update', ()=> {

            if (!this.initialized)
              return;

            this.scoreText.setText(this.scene.score.toString());

            if (this.healthText)
              this.healthText.setText(this.scene.player.health > 0 ? this.scene.player.health.toString() : '0');
            
            if (this.scene.timeLeft > 0.01)
            {
                this.scene.timeLeft -= 0.02;
                this.timeText.setText(this.scene.timeLeft.toFixed(3));
                if (this.scene.timeLeft <= 10.0)
                    this.timeText.setTint(0xff0000);
            }
            else
            {
              if (gameOver)
                return;

              gameOver = true;

              this.timeText.setText('0');
              this.scene.gameOver();
            }
      });

    }

    private async initMultiplayer()
    {
        this.scene.add.text(50, 10, 'DEATHMATCH', {fontSize: "15px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
  
        this.scene.add.text(50, 120, 'TIME LEFT: ', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.timeText = this.scene.add.text(180, 120, this.scene.timeLeft.toString(), {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
  
      ////score text
        this.scene.add.text(50, 50, 'SCORE: ', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.scoreText = this.scene.add.text(180, 50, this.scene.score.toString(), {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      
      ////heath
        this.scene.add.text(50, 90, 'HEALTH: ', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.healthText = this.scene.add.text(180, 90, this.scene.player.health.toString(), {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        //this.initialized = true;
    }

    private async initSkeetShoot()
    {
         //this.scene.add.circle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 4, 0xff0000);
        //this.crossHairs.depth = 1;
        this.scene.add.text(50, 10, 'MEATBALL SKEET SHOOTING', {fontSize: "15px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
     
        this.scene.add.text(50, 120, 'TIME LEFT: ', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.timeText = this.scene.add.text(180, 120, this.scene.timeLeft.toString(), {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
  
      ////score text
        this.scene.add.text(50, 50, 'SCORE: ', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.scoreText = this.scene.add.text(180, 50, this.scene.score.toString(), {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        //this.initialized = true;
    }

    public alert(message: string, optional?: string): void
    {
      this.scene.add.text(this.scene.cameras.main.width / 2 - (20 / 100) * this.scene.cameras.main.width, 300, message, {fontSize: "40px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      if (optional)
      {
        let optionalText = this.scene.add.text(this.scene.cameras.main.width / 2 - (10 / 100) * this.scene.cameras.main.width, 360, optional, {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.scene.tweens.add({targets: optionalText, alpha: 0, duration: 2000, ease: 'Sine.easeOut', repeat: -1, yoyo: true, yoyoDelay: 500});
      }
    }
  }
  
  