
import { System } from '../internals/Config';


export class Alerts extends Phaser.Scene {

    public _scene: any

    private GAME_WIDTH: number
    private GAME_HEIGHT: number

    private popUpSmall: Phaser.GameObjects.Text
    private popUpLarge: Phaser.GameObjects.Text

    private optionalText: Phaser.GameObjects.Text
    private optionalTween: Phaser.Tweens.Tween


    constructor(){
      super('Alerts');
    }

    private create(scene: any): void
    {

      System.Process.app.ui.listen(this, 'Preload'); 

      this._scene = scene;

      this.popUpSmall = this.add.text(0, 0, '', { fontFamily: "Bangers" }).setColor("#ffff00").setStroke('#ff0000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);
      this.popUpLarge = this.add.text(0, 0, '', { fontFamily: "Digitizer" }).setColor("#ffff00").setStroke('#ff0000', 4).setShadow(2, 2, '#000000', 1, false);

      this.optionalText = this.add.text(System.Config.isPortrait(this) ? this.GAME_WIDTH / 2 - 70 : this.GAME_WIDTH / 2 - 65, this.GAME_HEIGHT / 2 - 180, '', { fontSize: "20px", fontFamily: "Digitizer" }).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false).setVisible(false);
      this.optionalTween = this.tweens.add({targets: this.optionalText, alpha: 0, duration: 500, ease: 'Sine.easeOut', repeat: -1, yoyo: true, yoyoDelay: 500});


    }


    //-------------------------------------


    public update(): void 
    {   

        const x = System.Config.mobileAndTabletCheck() ? System.Config.isPortrait(this) ? this.GAME_WIDTH / 2 - 120 : this.GAME_WIDTH / 2 - 110 : this.GAME_WIDTH / 2 - 110,
              y = this.GAME_HEIGHT / 2 - 280,
              sm = System.Config.mobileAndTabletCheck() ? 20.8 : 30.0,
              lg = System.Config.mobileAndTabletCheck() ? 30.2 : 30.4;

        this.popUpSmall?.setFontSize(sm).setPosition(x, System.Config.mobileAndTabletCheck() && System.Config.isLandscape(this) ? this.GAME_HEIGHT / 2 - 380 : y);
        this.popUpLarge?.setFontSize(lg).setPosition(x - 15, y);

    }


    //------------------------------------ pop up notification

    
    public alert(size: string, message: string, optional?: string): void
    {   

      this.time.delayedCall(500, () => {

        switch (size)
        {

          case 'small': 
            this.popUpSmall?.setVisible(true).setText(message);
            this.popUpLarge?.setVisible(false);
          break;

          case 'large': 
            this.popUpLarge?.setVisible(true).setText(message);
            this.popUpSmall?.setVisible(false);
          break;
          
        }

        if (optional) {

          this.optionalText?.setVisible(true).setText(optional);
          this.optionalTween?.play();
        }

        else
          this.time.delayedCall(3000, () => this.stopAlerts());

      });
    }


    //------------------------------------ stop all pop ups


    public stopAlerts(): void
    {
      this.popUpLarge?.setVisible(false);
      this.popUpSmall?.setVisible(false);
      this.optionalText?.setVisible(false);
      this.optionalTween?.stop();
    }


}
  