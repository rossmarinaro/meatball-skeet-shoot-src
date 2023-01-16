

export class Background extends Phaser.Scene {
    constructor(){
        super('Background');
    }
    create(correspondingScene)
    {
        ////display shader

        this.shader;
        switch(correspondingScene)
        {

        //-------------------- shaders

            case 'preload': 
                this.shader = System.Process.shaders.base.checkers; 
                this.add.shader(this.shader, this.scale.width / 2, this.scale.height / 2, this.cameras.main.width, this.cameras.main.height);
            break;
            case 'intro': 
                this.shader = System.Process.shaders.base.vortex; 
                this.add.shader(this.shader, this.scale.width / 2, this.scale.height / 2, this.cameras.main.width, this.cameras.main.height);
                this.shader2 = System.Process.shaders.base.disco; 
                this.add.shader(this.shader2, this.scale.width / 2, this.scale.height / 2, this.cameras.main.width, this.cameras.main.height);
                this.cameras.main.setPostPipeline(System.Process.shaders.post.hueRotate);
            break;


        //------------------------ menu splash

            case 'menu':
                this.iter = 0; 
                this.pipelineTime = 0;
                this.tileSprites = []; 
                this.tileSprites2 = []; 
                this.tileSprites3 = []; 
                this.tileSprites4 = [];
                this.add.image(500, 200, 'pixel').setScale(270);
                this.discoShader = System.Process.shaders.base.disco2; 
                this.add.shader(this.discoShader, this.scale.width / 2, this.scale.height / 2, this.cameras.main.width, this.cameras.main.height);
                let frames_0 = ['', '', '', '', ''],
                    frames_1 = ['', '', '', '', ''],
                    frames_2 = ['', '', '', '', ''],
                    frames_3 = ['', '', '', '', ''],
                    frames_4 = [''];

                for (let z = 0; z < frames_0.length; ++z)
                {
                    this.tileSprites[z] = this.add.tileSprite(z * 640, 0, 120, this.cameras.main.height * 2, 'bkgnd_intro', frames_0[z]).setOrigin(0.5, 0.5).setTint(0xff0ff, 0xffff00, 0x0000ff, 0xff0000);
                    this.tweens.add({targets: this.tileSprites[z], alpha: {value: 1, duration: 3000, ease: 'Power1'}, yoyo: true, repeat: -1});
                }
                for (let z = 0; z < frames_1.length; ++z)
                {
                    this.tileSprites[z] = this.add.tileSprite(z * 490, 0, 120, this.cameras.main.height * 2, 'bkgnd_intro', frames_1[z]).setOrigin(0.5, 0.5).setTint(0xff0ff, 0xffff00, 0x0000ff, 0xff0000);
                    this.tweens.add({targets: this.tileSprites[z], alpha: {value: 1, duration: 3000, ease: 'Power1'}, yoyo: true, repeat: -1});
                }
                for (let z = 0; z < frames_2.length; ++z)
                {
                    this.tileSprites2[z] = this.add.tileSprite(z * 340, 0, 120, this.cameras.main.height * 2, 'bkgnd2_intro', frames_2[z]).setOrigin(0.5, 0.5).setTint(0xff0ff, 0xffff00, 0x0000ff, 0xff0000).setAlpha(0);
                    this.tweens.add({targets: this.tileSprites2[z], alpha: {value: 1, duration: 5000, ease: 'Power1'}, yoyo: true, repeat: -1});
                }
                for (let z = 0; z < frames_3.length; ++z) 
                    this.tileSprites3[z] = this.add.tileSprite(z * 190, 0, 120, this.cameras.main.height * 2, 'supreme_leader_cropped', frames_3[z]).setOrigin(0.5, 0.5).setTint(0xff0ff, 0xffff00, 0x0000ff, 0xff0000);
            
                for (let z = 0; z < frames_4.length; ++z)
                {
                    this.tileSprites4[z] = this.add.tileSprite(z * 60, 0, 120, this.cameras.main.height * 2, 'bkgnd3_intro', frames_4[z]).setOrigin(0.5, 0.5).setTint(0xff0ff, 0xffff00, 0x0000ff, 0xff0000).setAlpha(0);
                    this.tweens.add({targets: this.tileSprites4[z], alpha: {value: 1, duration: 8000, ease: 'Power1'}, yoyo: true, repeat: -1});
                }
                this.loaded = true;
                this.fireShader = System.Process.shaders.base.fire;
                this.add.shader(this.fireShader, this.scale.width / 2, this.scale.height / 2, this.cameras.main.width, this.cameras.main.height);
                this.cameras.main.setPostPipeline(System.Process.shaders.post.hueRotate);
            break;

            case 'blank':
                this.blank = this.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 100000, 100000));
            break;
        };
    }
    update()
    {
		if (this.loaded === true)
		{
			this.pipelineTime += 0.005;
			var x = 1;
			for (let i = 0; i < this.tileSprites.length; ++i)
			{
				this.tileSprites[i].tilePositionX += x;
				this.tileSprites[i].tilePositionY += x;
				x *= -1;
			}
			for (let i = 0; i < this.tileSprites2.length; ++i)
			{
				this.tileSprites2[i].tilePositionX += x;
				this.tileSprites2[i].tilePositionY += x;
				x *= -1;
			}
			for (let i = 0; i < this.tileSprites3.length; ++i)
			{
				this.tileSprites3[i].tilePositionX += x;
				this.tileSprites3[i].tilePositionY += x;
				x *= -1;
			}
			for (let i = 0; i < this.tileSprites4.length; ++i)
			{
				this.tileSprites4[i].tilePositionX += x;
				this.tileSprites4[i].tilePositionY += x;
				x *= -1;
			}
			this.iter += 0.01;
		}
    }
}