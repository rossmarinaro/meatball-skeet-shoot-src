// HUD

import * as ENABLE3D from '@enable3d/phaser-extension';
import { SkeetShoot } from './main';

export class HUD3D extends Phaser.Scene {

    public _scene: any
    private initialized: boolean = false;
    
    private crossHairs: {
      _1: Phaser.GameObjects.Rectangle
      _2: Phaser.GameObjects.Rectangle
    }

    private ammo: Phaser.GameObjects.Text

    private textA: Phaser.GameObjects.Text
    private textAValue: Phaser.GameObjects.Text

    private textB: Phaser.GameObjects.Text
    private textBValue: Phaser.GameObjects.Text

    private textC: Phaser.GameObjects.Text
    private textCValue: Phaser.GameObjects.Text


    constructor(){
      super('HUD3D');
    }

    public async _init(): Promise<void>
    {

          
      this.crossHairs = {
          _1: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 50, 2, 0x000000),
          _2: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 2, 50, 0x000000)
      }
      
      await this.createUI(20, 'TIME LEFT: ', 'HIT: ', 'LEVEL: '); 

      //listen for resize

      this.scale.on('resize', ()=> this.resizeWindow(this), false);
      screen.orientation?.addEventListener('change', ()=> this.resizeWindow(this), false);
      screen.orientation?.addEventListener('webkitfullscreenchange', ()=> this.resizeWindow(this), false);

      this.initialized = true;

   
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

 
    public runUpdate(scene: any): void
    {

      let gameOver = false;

      //----------- on scene update
  

          if (!this.initialized || (scene.player === null || !scene.player.raycaster))
            return;

            
          scene.third.camera.getWorldDirection(scene.player.raycaster.ray.direction);
              

          //----------toggle perspective camera


          for (let i of Object.values(this.crossHairs))
            if (scene.controller)
              i.setVisible(scene.controller.perspectiveControls.type === 'first' ? true : false);

          
          //--------- update ammo text


          if (this.ammo)
            this.ammo
              .setText(
                scene.player.currentEquipped.quantity >= 1 ? 
                scene.player.currentEquipped.quantity.toString() : '0'
              )
              .setColor(scene.player.currentEquipped.quantity >= 1 ? "#ffffff" : "#ff0000")
              .setStroke(scene.player.currentEquipped.quantity >= 1 ? '#000000' : '#ffffff', 3);


          //---------- update textA


            if (this.textA && scene.timeLeft)
            {

              //timed game

              const exit = () => {

                if (gameOver)
                return;
            
                gameOver = true;
            
                if (this.textAValue)
                  this.textAValue.setText('0');

                scene.gameOver();

              }

              if (scene.timeLeft === '0:00')
                exit();

              if (SkeetShoot.getGameState())
              {

                //set red tint to time format if below 10 seconds

                this.textAValue.setText(scene.timeLeft);

                if (
                  Number(scene.timeLeft.substr(0, 1)) === 0 && 
                  Number(scene.timeLeft.substr(2, 1)) === 0 &&
                  Number(scene.timeLeft.substr(3, 1)) <= 9
                )
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

    }

  
    private resizeWindow(scene: Phaser.Scene | ENABLE3D.Scene3D): void 
    {

      if (!scene.scene.settings.active)
          return;

        this.crossHairs._1.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
        this.crossHairs._2.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
 
    }
}
  
