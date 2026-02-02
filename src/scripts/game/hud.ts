import * as ENABLE3D from '@enable3d/phaser-extension'
import { System } from '../internals/Config'
import { ThirdDimension } from '../internals/ThirdDimension'
import { AudioManager } from '../internals/Audio'

export class HUD3D extends Phaser.Scene {

    public _scene: any 
  
    private initialized: boolean
    private inititalText: { A?: string, B?: string, C?: string, D?: string } 

    private voice: Phaser.GameObjects.Sprite

    private textA: Phaser.GameObjects.Text
    private textAValue: Phaser.GameObjects.Text

    private textB: Phaser.GameObjects.Text
    private textBValue: Phaser.GameObjects.Text

    private textC: Phaser.GameObjects.Text
    private textCValue: Phaser.GameObjects.Text

    private textD: Phaser.GameObjects.Text
    private textDValue: Phaser.GameObjects.Text

    private crossHairs: {
      _1: Phaser.GameObjects.Rectangle
      _2: Phaser.GameObjects.Rectangle
    }

    private damageIndicator: {
        left: Phaser.GameObjects.Sprite | null
        right: Phaser.GameObjects.Sprite | null
        up: Phaser.GameObjects.Sprite | null
        down: Phaser.GameObjects.Sprite | null
    }

    private equippedWeapon: {
      icon: Phaser.GameObjects.Image | null,
      key: string
    }

    private ammo: {
      text: Phaser.GameObjects.Text | null
      quantity: Phaser.GameObjects.Text | null
    }

    private progressBarGraphics: {
      base: Phaser.GameObjects.Graphics | null
      border: Phaser.GameObjects.Graphics | null
      overlay: Phaser.GameObjects.Graphics | null
    } 

    private barWidth: number = 100 
    private barHeight: number = 10

    constructor(){
      super('HUD3D');
    }

    private async create(scene: ENABLE3D.Scene3D): Promise<void>
    {  
        this._scene = scene;
        this.initialized = false;
   
        this.crossHairs = {
            _1: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 50, 2, 0x000000),
            _2: this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 2, 50, 0x000000)
        }

        this.crossHairs._1.setVisible(false);
        this.crossHairs._2.setVisible(false);

        this.equippedWeapon = { icon: null, key: '' }
        this.progressBarGraphics = { base: null, border: null, overlay: null } 
        this.damageIndicator = { left: null, right: null, up: null, down: null }
        this.ammo = { text: null, quantity: null }
        
        await this.createUI(20, false, 'TIME LEFT: ', 'SCORE: ', 'LEVEL: '); 

        this.initialized = true;

    }


    //------------------------------------ create UI


    private async createUI (

      size: number, 
      healthBar: boolean, 
      textA?: string, 
      textB?: string, 
      textC?: string, 
      textD?: string

    ): Promise<void>
    {

      this.inititalText = {
        A: textA,
        B: textB,
        C: textC,
        D: textD
      }

      //current selected weapon icon

      this.equippedWeapon.icon = this.add.image(80, this.cameras.main.height - 100, this.equippedWeapon.key).setScale(0.7).setVisible(false);

      this.ammo.text = this.add.text(20, this.cameras.main.height - 50, 'AMMO: ', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffff00', 2).setShadow(2, 2, '#000000', 1, false);
      this.ammo.quantity = this.add.text(110, this.cameras.main.height - 52, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ff0000").setStroke('#ffffff', 3);
  
      this.textA = this.add.text(20, 10, textA ? textA : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textAValue = this.add.text(150, 10, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textB = this.add.text(20, 40, textB ? textB : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textBValue = this.add.text(150, 40, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
    
      this.textC = this.add.text(20, 80, textC ? textC : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textCValue = this.add.text(150, 80, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);

      this.textD = this.add.text(20, 120, textD ? textD : '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
      this.textDValue = this.add.text(150, 120, '', {fontSize: size + "px", fontFamily: "Digitizer"}).setColor("#ffff00").setStroke('#000000', 4).setShadow(2, 2, '#000000', 1, false);
  
      //health bar

      if (healthBar) {

        this.progressBarGraphics.base = this.add.graphics().fillStyle(0x424242, 1).fillRect(this.cameras.main.width - 130, 10, this.barWidth, this.barHeight);
        this.progressBarGraphics.border = this.add.graphics({lineStyle: {width: 3, color: 0x000000}}).strokeRect(this.cameras.main.width - 130, 10, this.barWidth, this.barHeight);

        this.progressBarGraphics.overlay = this.add.graphics();   
      }

      //damage direction

      this.damageIndicator.left = this.add.sprite(this.cameras.main.width / 2 - 50, 60, 'damage_indicator').setVisible(false).setAngle(-90);
      this.damageIndicator.right = this.add.sprite(this.cameras.main.width / 2 + 50, 60, 'damage_indicator').setVisible(false).setAngle(90);
      this.damageIndicator.up = this.add.sprite(this.cameras.main.width / 2, 25, 'damage_indicator').setVisible(false);
      this.damageIndicator.down = this.add.sprite(this.cameras.main.width / 2, 100, 'damage_indicator').setVisible(false).setAngle(180);

    }


  //--------------------------------- update


  public update(): void
  {
    if (!this.initialized)
        return;

    if (!this._scene.third)
        return;

    //is mobile in landscape view

    const mobileLandscape = System.Config.mobileAndTabletCheck() && System.Config.isLandscape(this._scene);

    //crosshairs 

    for (let line of Object.values(this.crossHairs))
        if (this._scene.controller && this._scene.controller.perspectiveControls)
            line?.setVisible(this._scene.controller.perspectiveControls.type === 'first' && ThirdDimension.camType === 3) 
                ?.setPosition(
                    !System.Config.isDesktop(this._scene) ? innerWidth / 2 : this.cameras?.main.width / 2, 
                    !System.Config.isDesktop(this._scene) ? innerHeight / 2 : this.cameras?.main.height / 2
                );
        else
            line?.setVisible(false);

    if (this._scene.player)
    {
        //update ammo text 

        this.ammo.text
        ?.setPosition(
            mobileLandscape ? innerWidth / 2 + 95 : 120, 
            mobileLandscape ? 10 : 
                System.Config.isLandscape(this._scene) ?
                this.cameras?.main.height - 50 : innerHeight - 50
            );

        if (this.ammo.quantity)
            this.ammo.quantity
            .setPosition(
            mobileLandscape ? innerWidth / 2 + 180 : 210, 
            mobileLandscape ? 8 : 
                System.Config.isLandscape(this._scene) ?  
                this.cameras.main.height - 52 : innerHeight - 52
            )
            .setText(
                !this._scene.player.currentEquipped.quantity || this._scene.player.currentEquipped.quantity === -1 ? 'N/A' :
                this._scene.player.currentEquipped.quantity >= 1 ? 
                this._scene.player.currentEquipped.quantity.toString() : '0'
            )
            .setColor(this._scene.player.currentEquipped.quantity >= 1 ? "#ffffff" : "#ff0000")
            .setStroke(this._scene.player.currentEquipped.quantity >= 1 ? '#000000' : '#ffffff', 3);
    
      //equipped weapon icon
  
        this.equippedWeapon.key = this._scene.player.currentEquipped.key;

        if (this.equippedWeapon.icon && this.equippedWeapon.key)
            this.equippedWeapon.icon?.setPosition(
                mobileLandscape ? innerWidth / 2 + 40 : 50, 
                mobileLandscape ? 20 : 
                System.Config.isLandscape(this._scene) ? this.cameras.main.height - 50 : innerHeight - 50
            )
            .setTexture(this.equippedWeapon.key)
            .setVisible(this.equippedWeapon.key.length > 0);

        //damage indicator

        if (this.damageIndicator.left)
            this.damageIndicator.left.setPosition(this.cameras.main.width / 2 - 50, 60);

        if (this.damageIndicator.right)
            this.damageIndicator.right.setPosition(this.cameras.main.width / 2 + 50, 60);

        if (this.damageIndicator.up)
            this.damageIndicator.up.setPosition(this.cameras.main.width / 2, 25);

        if (this.damageIndicator.down)
            this.damageIndicator.down.setPosition(this.cameras.main.width / 2, 100);
    }
    
    else if (this.ammo.text)
        this.ammo.text?.setVisible(false);

    //------------ update textA

        if (this.textA)
        {
            if ((this._scene as any).getGameState)
            {

                const currTime = (this._scene as any).getTime;

                if (currTime) 
                {
                    this.textAValue?.setText(currTime);

                    //set red tint to time format if below 10 seconds

                    if (
                        parseInt(currTime.substring(0, 1)) === 0 && 
                        parseInt(currTime.substring(currTime.length - 1, 1).replace(':', '')) === 0 &&
                        parseInt(currTime.substring(currTime.length, 1).replace(':', '')) <= 9
                    )
                        this.textAValue?.setTint(0xff0000); 
                    else 
                        this.textAValue?.clearTint();
                }
            }
            else 
                this.textAValue?.setText('0:00');
        } 

        if (this.textB)
            this.textBValue.setText((this._scene as any).getScore).setVisible((this.scene as any).getGameState); 

        if (this.textC)
            this.textCValue.setText((this._scene as any).getLevel).setVisible((this.scene as any).getGameState); 
    }

}
  
