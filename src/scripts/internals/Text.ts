/***  TEXT / SCENE UI for text ****/

import { System } from './Config'
import { Game } from '../game/game'
import { AudioManager } from './Audio'

export class Text {

    public static texts: number = 0
    public static textContent: string[] = []
    public static color: string = ''
    public static acceptString: string = ''
    
    public static fontSystem: { 
        intro: string
        game: string
        select: string 
    } = {
        intro: System.Config.mobileAndTabletCheck() ? '2.4rem' : '2.5rem',
        game: System.Config.mobileAndTabletCheck() ? '1.7rem' : '2.5rem',
        select: System.Config.mobileAndTabletCheck() ? '3rem' : '4rem'
    }

//--------------------- reset text array


    public static resetTexts(): void {

        this.textContent.length = 0;
		this.texts = 0;
    }
    

//--------------------- set interactive options


    private static async setInteractiveText(scene: Phaser.Scene, text: string | undefined, bool: boolean): Promise<string | null>
    {
        const _scene = scene.scene.get('TextUI'),
        
        timeOut = async () => { return new Promise(res => scene.time.delayedCall(2000, () => res(null))); }
     
        if (_scene['blockOptions'])
            await timeOut();
    
        return bool ? 
            _scene['showOptions'](scene, text) : null;
    }


//---------------------- output text to ui 


    public static async exec (

        scene: Phaser.Scene, 
        textType: string, 
        content: string, 
        textColor?: string | number | null, 
        options?: boolean, 
        optionsArray?: string[] | undefined, 
        stage?: string, 
        bool?: boolean | null

    ): Promise<string>
    {

        this.resetTexts();

        if (stage !== undefined && stage !== null && stage !== '')
            textType = 'select'

        this.textContent.push(content);

        scene.scene.run('TextUI', [
            textType, 
            textColor, 
            optionsArray ? options : false, 
            optionsArray ? optionsArray : null
        ]);
       
        scene.time.delayedCall(500, () => {

            const isSelectable = textType === 'select' || textType === 'dialog';

            if (isSelectable && bool) {
                scene.time.delayedCall(1500, () => this.setInteractiveText(scene, stage, bool));
                this.textContent.length = 0;
            }
        });

    //text content

        return content;

    }
    
} 


//---------------------------------------------------- Text UI 


export class TextUI extends Phaser.Scene {

    public blockOptions: boolean 
    public options: boolean

    private avatar: Phaser.GameObjects.Image
    private avatarBubble1 : Phaser.GameObjects.Sprite
    private avatarBubble2: Phaser.GameObjects.Text
    private textOutput: Phaser.GameObjects.Text
    private txtGraphics: Phaser.GameObjects.Graphics
    private fadeOutDialog: Phaser.Tweens.Tween
    private fadeAvatarBubble: Phaser.Tweens.Tween
    private textType: string
    private optionsArray: string[]
    private eventTyping: any
    private textToShow: string
    private txt: any 

    constructor(){
        super('TextUI');
    }

    private create([
        textType, 
        textColor, 
        options, 
        optionsArray
    ]): void
    {   

        this.options = options;
        this.textType = textType;
        this.optionsArray = optionsArray;
        this.eventTyping = null;
        this.textToShow = '';
        this.txt = null; 
        this.blockOptions = false;

        //text showing the message
    
        switch(textType)
        {

            case 'intro' : this.textOutput = this.add.text((5 / 100) * this.cameras.main.width, 0, '', { font: `${Text.fontSystem.intro} Bangers`, wordWrap: { width: this.scale.width - (10 / 100) * this.scale.width, useAdvancedWrap: true}, align: 'left'}).setColor('#ffff00').setStroke('#ff0000', 4).setShadow(4, 4, '#000000', 1, false).setDepth(2); break;
            case 'dialog' : 
            case 'select' : this.textOutput = this.add.text((5 / 100) * this.cameras.main.width, 0, '', { font: `${Text.fontSystem.game} Bangers`, wordWrap: { width: this.scale.width - (10 / 100) * this.scale.width, useAdvancedWrap: true}, align: 'left'}).setColor('#ffffff').setStroke('#000000', 5).setDepth(2); break;
            case 'multiplayer' : 

            if (!textColor)
                return;

              //avatar

                this.avatar = this.add.image(50, 50, `avatar_player_${textColor}`).setVisible(false); 
                this.avatarBubble1 = this.add.sprite(this.avatar.x + 80, this.avatar.y - 10, 'speech_bub').setFrame('fr03').setFlipX(true).setScale(0.4).setVisible(false); 
                this.avatarBubble2 = this.add.text(this.avatarBubble1.x, this.avatarBubble1.y - 15, '!', { font: "35px Digitizer"}).setColor('#000000').setVisible(false); 

                this.textOutput = this.add.text(this.avatar.x + 50, this.avatar.y, '', { font: `${ Text.fontSystem.game } Arial`, wordWrap: { width: this.scale.width - (10 / 100) * this.scale.width, useAdvancedWrap: true}, align: 'left'}).setColor(textColor).setStroke('#000000', 5).setDepth(2).setVisible(false); 

                //show avatar of other players

                const textOnly = (Text.textContent.length >= 1 && Text.textContent[0] !== '');

                if (textColor && !textColor.startsWith('#') && textOnly)   
                    this.textOutput.setVisible(true);

                this.avatar.setVisible(true);
                
                //show speech bubble during voice chat

                if (this.avatar.visible && !textOnly) {
                    this.avatarBubble1.setVisible(true); 
                    this.avatarBubble2.setVisible(true); 
                }

            break;
        }

        this.txtGraphics = this.add.graphics();
        this.txtGraphics.fillStyle(0x1f317d, 0.6);
        this.txtGraphics.fillRect(200, 400, 500, 110).setVisible(false);

    //fade out text

        this.fadeOutDialog = this.tweens.add({ persist: true, targets: this.textOutput, alpha: 0, duration: 1500, ease: 'Power1', onComplete: () => {
                this.textOutput?.setVisible(false);
                this.avatar?.setVisible(false);
            }   
        }).pause();

        this.fadeAvatarBubble = this.tweens.add({ persist: true, targets: [ this.avatarBubble1, this.avatarBubble2 ], alpha: 0, duration: 1500, ease: 'Power1', onComplete: () => {
                this.avatarBubble1?.setVisible(false);
                this.avatarBubble2?.setVisible(false);
                this.avatar?.setVisible(false);
            }   
        }).pause();

    //start sequence

        this.showDialogue(this.txt);
    } 


    //---------------------------------------

 
    public update(): void
    {

        if (this.textOutput)
            this.textOutput.setY(System.Config.isPortrait(this) || this.cameras.main.height > this.cameras.main.width ? 50 : 0);
        
    }


    //------------------------------------------message


    private hideDialogue (): void
    { 
        //hide the current dialogue or goes to the next one in a sequential dialog, increment text output

        Text.texts++; 

        this.showDialogue(this.txt);     
      
        if (Text.texts >= Text.textContent.length) 
        {
            Text.texts = 0;    
            Text.textContent.length = 0; 

            this.fadeOutDialog.play(); 

            if (!this.options)
                this.scene.stop('TextUI');
        } 
    }
    

    //------------------------------------shows the dialogue window with a specific message


    private showDialogue (text: string | null): void 
    { 

        text = Text.textContent[Text.texts];

        if (text != null)
        {
            if (Text.textContent.length === 1 && Text.textContent[0] === '')
            {
                Text.textContent.length = 0;
                Text.texts = 0;

                return;
            }

            let i = 0;

            this.textToShow = '';
            this.textOutput.text = this.textToShow;
            
            if (this.eventTyping !== undefined && this.eventTyping !== null) 
                this.eventTyping.remove(false); 

            //types out text array by character
        
            this.eventTyping = this.time.addEvent({
                delay: 50, args: [text], repeat: text.length - 1, 
                callback: (text: any): void => {
                    this.textToShow += text[i];
                    this.textOutput.text = this.textToShow;
                    i++;
                }
            });

            this.time.addEvent({args: [text], delay: text.length * 50 + 500, callback: this.hideDialogue, callbackScope: this});
        }

        else if (!this.options || this.blockOptions)
            this.scene.stop('TextUI');
       
    }

}








