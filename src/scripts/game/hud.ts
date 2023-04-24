// HUD

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { SkeetShoot } from './main';

export class HUD3D extends Phaser.Scene {

    public _scene: any
    private initialized: boolean = false;

    private GAME_WIDTH: number
    private GAME_HEIGHT: number

    private crossHairs: {
      _1: Phaser.GameObjects.Rectangle
      _2: Phaser.GameObjects.Rectangle
    }

    private ammo: Phaser.GameObjects.Text
    private popUpSmall: Phaser.GameObjects.Text
    private popUpLarge: Phaser.GameObjects.Text

    private textA: Phaser.GameObjects.Text
    private textAValue: Phaser.GameObjects.Text

    private textB: Phaser.GameObjects.Text
    private textBValue: Phaser.GameObjects.Text

    private textC: Phaser.GameObjects.Text
    private textCValue: Phaser.GameObjects.Text

    private optionalText: Phaser.GameObjects.Text
    private optionalTween: Phaser.Tweens.Tween


    constructor(){
      super('HUD3D');
    }

    private create(scene: ENABLE3D.Scene3D): void
    {

      System.Process.app.ui.listen(this, 'Preload'); 

      this._scene = scene;

      const x = this.GAME_WIDTH / 2 - 120,
            y = this.GAME_HEIGHT / 2 - 250;

      this.popUpSmall = this.add.text(x, y, '', { fontSize: "1.5rem", fontFamily: "Bangers" }).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);
      this.popUpLarge = this.add.text(x, y, '', { fontSize: "1.7rem", fontFamily: "Digitizer" }).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false)//.setVisible(false);

      this.optionalText = this.add.text(this.GAME_WIDTH / 2 - 65, this.GAME_HEIGHT / 2 - 180, '', {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);
      this.optionalTween = this.tweens.add({targets: this.optionalText, alpha: 0, duration: 2000, ease: 'Sine.easeOut', repeat: -1, yoyo: true, yoyoDelay: 500});
    
      this.initialized = true;

      //listen for resize

      this.scale.on('resize', ()=> this.resizeWindow(this), false);
      screen.orientation?.addEventListener('change', ()=> this.resizeWindow(this), false);
      screen.orientation?.addEventListener('webkitfullscreenchange', ()=> this.resizeWindow(this), false);

    }



    //------------------------------------

    public async initDisplay(): Promise<void>
    {
      
      System.Process.app.ui.stop(this);
      
        this.crossHairs = {
          _1: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 50, 2, 0x000000),
          _2: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 2, 50, 0x000000)
      }
        
      await this.createUI(20, 'TIME LEFT: ', 'HIT: ', 'LEVEL: '); 
    }

    //------------------------------------ create UI


    private async createUI (size: number, textA?: string, textB?: string, textC?: string): Promise<void>
    {

      this.add.text(50, 10, 'AMMO: ', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffff00', 2).setShadow(2, 2, '#000000', 1, false);
      this.ammo = this.add.text(130, 6, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffffff', 3);
  
      this.textA = this.add.text(50, 50, textA ? textA : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textAValue = this.add.text(180, 50, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textB = this.add.text(50, 80, textB ? textB : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textBValue = this.add.text(180, 80, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textC = this.add.text(50, 110, textC ? textC : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textCValue = this.add.text(180, 110, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
    }


    //------------------------------------- update


    public runUpdate(): void
    {

      let gameOver = false;

      //----------- on scene update
  
        this._scene.events.on('update', ()=> {

          if (!this.initialized || (this._scene.player === null || !this._scene.player.raycaster))
            return;

            
          this._scene.third.camera.getWorldDirection(this._scene.player.raycaster.ray.direction);
              

          //----------toggle perspective camera


          for (let i of Object.values(this.crossHairs))
            if (this._scene.controller)
              i.setVisible(this._scene.controller.perspectiveControls.type === 'first' ? true : false);

          
          //--------- update ammo text


          if (this.ammo)
            this.ammo
              .setText(
                this._scene.player.currentEquipped.quantity >= 1 ? 
                this._scene.player.currentEquipped.quantity.toString() : '0'
              )
              .setColor(this._scene.player.currentEquipped.quantity >= 1 ? "#ffffff" : "#ff0000")
              .setStroke(this._scene.player.currentEquipped.quantity >= 1 ? '#000000' : '#ffffff', 3);


          //---------- update textA


            if (this.textA)
            {

              this.textAValue.setVisible(SkeetShoot.getGameState())

              //timed game

              const exit = () => {

                if (gameOver)
                return;
            
                gameOver = true;
            
                if (this.textAValue)
                  this.textAValue.setText('0');

                this._scene.gameOver();

              }

              if (this._scene.timeLeft <= 0)
                exit();

              if (SkeetShoot.getGameState())
              {
                this._scene.timeLeft -= 0.025;
                
                this.textAValue.setText(this._scene.timeLeft.toFixed(3));
                if (this._scene.timeLeft <= 10.0)
                  this.textAValue.setTint(0xff0000);  
              }
              else
                exit();

            }
 
          //---------- update textB

            if (this.textB)
              this.textBValue.setText(SkeetShoot.getScore()).setVisible(SkeetShoot.getGameState()); 

          //---------- update textB

            if (this.textC)
              this.textCValue.setText(SkeetShoot.getLevel()).setVisible(SkeetShoot.getGameState()); 

        });
    }


    //------------------------------------ pop up notification

    
    public alert(size: string, message: string, optional?: string): void
    {   

      this.time.delayedCall(500, () => {

        switch (size)
        {
          case 'small': 
            this.popUpSmall.setVisible(true).setText(message);
            this.popUpLarge.setVisible(false);
          break;
          case 'large': 
            this.popUpLarge.setVisible(true).setText(message);
            this.popUpSmall.setVisible(false);
          break;
        }

        if (optional)
        {

          this.optionalText.setVisible(true).setText(optional);
          this.optionalTween.play();
        }

        else
          this.time.delayedCall(3000, () => this.stopAlerts());
      });
    }


    //------------------------------------ stop all pop ups


    public stopAlerts(): void
    {
      this.popUpLarge.setVisible(false);
      this.popUpSmall.setVisible(false);
      this.optionalText.setVisible(false);
      this.optionalTween.stop();
    }


  //------------------------------------- resize
  

    private resizeWindow(scene: Phaser.Scene | ENABLE3D.Scene3D): void 
    {

      if (!scene.scene.settings.active)
          return;

        this.crossHairs._1.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
        this.crossHairs._2.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
 
    }
}
  
