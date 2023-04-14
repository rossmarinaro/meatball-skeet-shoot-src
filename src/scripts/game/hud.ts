//------------------------------------------------- HUD

import * as ENABLE3D from '@enable3d/phaser-extension';


export class HUD3D {

    private scene: any
    private initialized: boolean = false;

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


    constructor(scene: ENABLE3D.Scene3D){
        this.scene = scene;
    }

    public async init(): Promise<void>
    {

      
    //------------- UI

      ////current weapon
      //this.scene.add.sprite(200, 200, 'automac1000_thumbnail').setAlpha(0.3);
      //this.add.graphics({fillStyle: {color: 0xB50003, alpha: 0.2}}).fillRoundedRect(10, 5, 340, 170, 20);

  
      this.crossHairs = {
          _1: this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 50, 2, 0x000000),
          _2: this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 2, 50, 0x000000)
      }
        
      await this.createUI(20, 'TIME LEFT: ', 'SCORE: '); 

      //pop up text

      this.popUpSmall = this.scene.add.text(this.scene.cameras.main.width / 2 - (20 / 100) * this.scene.cameras.main.width, 300, '', {fontSize: "20px", fontFamily: "Bangers"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);
      this.popUpLarge = this.scene.add.text(this.scene.cameras.main.width / 2 - (20 / 100) * this.scene.cameras.main.width, 300, '', {fontSize: "40px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);

      this.initialized = true;

      //listen for resize

        this.scene.scale.on('resize', ()=> this.resizeWindow(this.scene), false);
        screen.orientation?.addEventListener('change', ()=> this.resizeWindow(this.scene), false);
        screen.orientation?.addEventListener('webkitfullscreenchange', ()=> this.resizeWindow(this.scene), false);

        let gameOver = false;

      //----------- on scene update
  
        this.scene.events.on('update', ()=> {

          if (!this.initialized || (this.scene.player === null || !this.scene.player.raycaster))
            return;

            
          this.scene.third.camera.getWorldDirection(this.scene.player.raycaster.ray.direction);
              

          //----------toggle perspective camera


          for (let i of Object.values(this.crossHairs))
            if (this.scene.controller)
              i.setVisible(this.scene.controller.perspectiveControls.type === 'first' ? true : false);

          
          //--------- update ammo text


          if (this.ammo)
            this.ammo
              .setText(
                this.scene.player.currentEquipped.quantity >= 1 ? 
                this.scene.player.currentEquipped.quantity.toString() : '0'
              )
              .setColor(this.scene.player.currentEquipped.quantity >= 1 ? "#ffffff" : "#ff0000")
              .setStroke(this.scene.player.currentEquipped.quantity >= 1 ? '#000000' : '#ffffff', 3);


          //---------- update textA


            if (this.textA)
            {

                //timed game

                if (this.scene.timeLeft > 0.01)
                {
                    this.scene.timeLeft -= 0.02;
                    this.textAValue.setText(this.scene.timeLeft.toFixed(3));
                    if (this.scene.timeLeft <= 10.0)
                        this.textAValue.setTint(0xff0000);
                }
                else
                {
                  if (gameOver)
                    return;

                  gameOver = true;

                  if (this.textAValue)
                    this.textAValue.setText('0');
                    
                  this.scene.gameOver();
                }
            }
 
          //---------- update textB

            if (this.textB)
              this.textBValue.setText(this.scene.score.toString()); 

        });

    }

    //------------------------------------ create UI


    private async createUI (size: number, textA?: string, textB?: string, textC?: string): Promise<void>
    {

      this.scene.add.text(50, 10, 'AMMO: ', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffff00', 2).setShadow(2, 2, '#000000', 1, false);
      this.ammo = this.scene.add.text(130, 6, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffffff', 3);
  
      this.textA = this.scene.add.text(50, 50, textA ? textA : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textAValue = this.scene.add.text(180, 50, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textB = this.scene.add.text(50, 80, textB ? textB : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textBValue = this.scene.add.text(180, 80, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

  
    }


    //------------------------------------ pop up notification

    public alert(size: string, message: string, optional?: string): void
    {
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
        const optionalText = this.scene.add.text(this.scene.cameras.main.width / 2 - (10 / 100) * this.scene.cameras.main.width, 360, optional, {fontSize: "20px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
        this.scene.tweens.add({targets: optionalText, alpha: 0, duration: 2000, ease: 'Sine.easeOut', repeat: -1, yoyo: true, yoyoDelay: 500});
      }
      else
        this.scene.time.delayedCall(3000, () => {
          this.popUpSmall.setVisible(false); 
          this.popUpLarge.setVisible(false);
        });
    }

  //------------------------------------- resize

    private resizeWindow(scene: Phaser.Scene | ENABLE3D.Scene3D): void 
    {

      if (!scene.scene.settings.active)
          return;

        this.crossHairs._1.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
        this.crossHairs._2.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
 
    }
}
  
