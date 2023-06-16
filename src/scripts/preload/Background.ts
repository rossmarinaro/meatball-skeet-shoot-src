import { System } from '../internals/Config';

export class Background extends Phaser.Scene {

    public shader: any
    public shader2: any


    constructor(){
        super('Background');
    }
    
    private create(correspondingScene: any): void
    {

        switch(correspondingScene.type)
        {

        //-------------------- shaders

            case 'main menu': 


                {

                    this.shader = System.Process.app.shaders.base.fire; 

                    const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'fire_pixel')//,
                          //shader = this.add.shader(this.shader, this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height);

                    this.events.on('update', () => {

                        background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
                        //shader.setPosition(this.cameras.main.width / 2, this.cameras.main.height)//.setSize(this.cameras.main.width, this.cameras.main.height);
                    });
                }

            break;

            case 'blank':
                this.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 100000, 100000));
            break;
        };
    }


}