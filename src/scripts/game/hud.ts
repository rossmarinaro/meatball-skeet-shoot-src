// HUD

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config';
import { SkeetShoot } from './main';

export class HUD3D extends Phaser.Scene {

    public _scene: any
    private initialized: boolean = false;
    
    private crossHairs: {
      _1: Phaser.GameObjects.Rectangle
      _2: Phaser.GameObjects.Rectangle
    }

    private ammo: {
      text: Phaser.GameObjects.Text | null
      quantity: Phaser.GameObjects.Text | null
    }

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

      this.ammo = {
        text: null,
        quantity: null
      }
      
      await this.createUI(20, 'TIME LEFT: ', 'HIT: ', 'LEVEL: '); 

      this.initialized = true;

   
    }

    //------------------------------------ create UI


    private async createUI (size: number, textA?: string, textB?: string, textC?: string): Promise<void>
    {

      this.ammo.text = this.add.text(20, this.cameras.main.height - 50, 'AMMO: ', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffff00', 2).setShadow(2, 2, '#000000', 1, false);
      this.ammo.quantity = this.add.text(110, this.cameras.main.height - 52, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffffff', 3);
  
      this.textA = this.add.text(20, 20, textA ? textA : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textAValue = this.add.text(180, 20, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textB = this.add.text(20, 50, textB ? textB : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textBValue = this.add.text(180, 50, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textC = this.add.text(20, 80, textC ? textC : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textCValue = this.add.text(180, 80, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
    }


    //------------------------------------- update

 
    public runUpdate(scene: any): void
    {

      let gameOver = false;

      if (!this.initialized || (scene.player === null || !scene.player.raycaster))
        return;

        
      scene.third.camera.getWorldDirection(scene.player.raycaster.ray.direction);
          

      //is mobile in landscape view

      const mobileLandscape = !System.Config.isDesktop(scene) && System.Config.isLandscape(scene);

      //crosshairs 
  
      for (let line of Object.values(this.crossHairs))
        if (scene.controller)
          line.setVisible(scene.controller.perspectiveControls.type === 'first' ? true : false)
              .setPosition(
                !System.Config.isDesktop(this._scene) ? innerWidth / 2 : this.cameras.main.width / 2, 
                !System.Config.isDesktop(this._scene) ? innerHeight / 2 : this.cameras.main.height / 2
              );
  
      //update ammo text
  
      if (this.ammo.text)
        this.ammo.text
          .setPosition(
            mobileLandscape ? innerWidth / 2 + 90 : 100, 
            mobileLandscape ? 10 : this.cameras.main.height - 50
          )
  
      if (this.ammo.quantity)
        this.ammo.quantity
          .setPosition(
            mobileLandscape ? innerWidth / 2 + 165 : 180, 
            mobileLandscape ? 8 : this.cameras.main.height - 52
          )
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

}
  
