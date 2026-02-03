import { System } from '../internals/Config'
import { HueRotatePostFX, PlasmaPost2FX, MultiPipeline, Shaders } from './shaders.js'
import { Scene3D, THREE } from '@enable3d/phaser-extension'
import { EffectComposer, RenderPass, ShaderPass } from '@enable3d/phaser-extension'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { Game } from '../game/game'

export enum BloomLayers { NONE, WEAPONS, LEVEL };

export class ShaderManager {

    private static initialized: boolean
    private static bloomComposerWeapons: EffectComposer
    private static bloomComposerWholeScreen: EffectComposer
    private static bloomComposerLevel: EffectComposer
    private static finalComposer: EffectComposer
    private static unrealBloomPassWeapons: UnrealBloomPass
    private static unrealBloomPassWholeScreen: UnrealBloomPass
    private static unrealBloomPassLevel: UnrealBloomPass
    private static baseMaterial: THREE.MeshBasicMaterial
    private static bloomLayerWeapons: THREE.Layers
    private static bloomLayerLevel: THREE.Layers
    private static materials: any = {}
    private static shader: typeof Shaders = Shaders 
    
    public static postProcessingWholeScene: boolean = false
    public static bloomObjects: string[] = []
    public static shaderMaterials: THREE.ShaderMaterial[] = []

    //2d base shaders

    public static base: any = {
        frag1: new Phaser.Display.BaseShader('shader_wave', this.shader.fragmentShader),
        frag2: new Phaser.Display.BaseShader('shader_wave', this.shader.fragmentShader2),
        wave: new Phaser.Display.BaseShader('shader_wave', this.shader.wave),
        vortex: new Phaser.Display.BaseShader('shader_vortex', this.shader.fragVortex),
        fire: new Phaser.Display.BaseShader('shader_fire', this.shader.fireShader),
        flare: new Phaser.Display.BaseShader('shader_flare', this.shader.flareShader),
        checkers: new Phaser.Display.BaseShader('shader_checkers', this.shader.checkers),
        hueTunnel: new Phaser.Display.BaseShader('shader_hue_tunnel', this.shader.hueTunnel),
        plasmaMask: new Phaser.Display.BaseShader('shader_plasma_mask', this.shader.plasmaMask),
        disco: new Phaser.Display.BaseShader('shader_disco', this.shader.disco),
        disco2: new Phaser.Display.BaseShader('shader_disco2', this.shader.disco2),
    }

    //2d post pipeline
 
    public static post: any = { 
        hueRotate: HueRotatePostFX,
        plasma: PlasmaPost2FX,
        multi: MultiPipeline,
    } 

    //-------------------

     
    public static init(scene: Phaser.Scene | Scene3D): void 
    { 
        this.bloomObjects.length = 0;
        this.shaderMaterials.length = 0;
        
        if (!this.initialized && !scene['third'] && scene.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) 
        {
            this.initialized = true;

            scene.renderer.pipelines
                .add('Hue', new this.post.multi(System.Process.game))
                .set2f('uResolution', System.Process.game.config.width as number, System.Process.game.config.height as number); 
        }

    }


    //------------------- 2d water pipeline toggle


    public static toggleWaterRenderer (scene: Phaser.Scene, bool: boolean): void {
        bool ? 
            scene.cameras.main.setPostPipeline(this.post.plasma) :
            scene.cameras.main.resetPostPipeline();
    }


    //------------------ 3d shader material


    public static createShaderMaterial(vert: string, frag: string, settings: { 
        uniforms: any, 
        defines?: any
        blending?: string,
        fog?: boolean,
        transparent?: boolean,
        depthTest?: boolean,
        depthWrite?: boolean,
        vertexColors?: boolean

    }): THREE.ShaderMaterial
    {
        //BLEND MODES: AdditiveBlending, SubtractiveBlending, MultiplyBlending, NormalBlending, NoBlending

        const shader = new THREE.ShaderMaterial({
            defines: settings.defines ? settings.defines : null,
            uniforms: settings.uniforms, 
            vertexShader: this.shader[vert], 
            fragmentShader: this.shader[frag],
            blending: settings.blending ? THREE[settings.blending] : THREE.NormalBlending, 
            transparent: settings.transparent ? settings.transparent : false,  
            depthTest: settings.depthTest ? settings.depthTest : false,
            depthWrite: settings.depthWrite ? settings.depthWrite : false,
            vertexColors: settings.vertexColors ? settings.vertexColors : false,
            fog: settings.fog ? settings.fog : false  
        });

        this.shaderMaterials.push(shader);

        return shader;
    }


    //-------------------------------- 3d init post processing


    public static setPostProcessingBloom (scene: Scene3D): void
    {
        this.baseMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.unrealBloomPassWeapons = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.5, 0);
        this.unrealBloomPassWholeScreen = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.5, 0);
        this.unrealBloomPassLevel = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 2.0, 0.5, 0);

        const renderPass = new RenderPass(scene.third.scene, scene.third.camera),
              outputPass = new OutputPass;
              
        this.bloomLayerWeapons = new THREE.Layers;
        this.bloomLayerWeapons.set(BloomLayers.WEAPONS);

        this.bloomLayerLevel = new THREE.Layers;
        this.bloomLayerLevel.set(BloomLayers.LEVEL);

        this.bloomComposerWeapons = new EffectComposer(scene.third.renderer);
        this.bloomComposerWeapons.renderToScreen = false;
        this.bloomComposerWeapons.addPass(renderPass);
        this.bloomComposerWeapons.addPass(this.unrealBloomPassWeapons);

        this.bloomComposerWholeScreen = new EffectComposer(scene.third.renderer);
        this.bloomComposerWholeScreen.renderToScreen = false;
        this.bloomComposerWholeScreen.addPass(renderPass);
        this.bloomComposerWholeScreen.addPass(this.unrealBloomPassWholeScreen);

        this.bloomComposerLevel = new EffectComposer(scene.third.renderer);
        this.bloomComposerLevel.renderToScreen = false;
        this.bloomComposerLevel.addPass(renderPass);
        this.bloomComposerLevel.addPass(this.unrealBloomPassLevel);

        const makeShaderPass = (bloomComposer: EffectComposer): ShaderPass => {
            const shaderPass = new ShaderPass(new THREE.ShaderMaterial({
                    uniforms: {
                        baseTexture: { value: null },
                        bloomTexture: { value: bloomComposer.renderTarget2.texture },
                    },
                    vertexShader: this.shader.three_std_Vert,
                    fragmentShader: this.shader.three_bloom_Frag,
                    defines: {}
                }
            ), 'baseTexture');

            shaderPass.needsSwap = true;

            return shaderPass;
        };

        const shaderPassWeapons = makeShaderPass(this.bloomComposerWeapons),
              shaderPassWholeScreen = makeShaderPass(this.bloomComposerWholeScreen),
              shaderPassLevel = makeShaderPass(this.bloomComposerLevel);

        this.finalComposer = new EffectComposer(scene.third.renderer);

        this.finalComposer.addPass(renderPass);
        this.finalComposer.addPass(shaderPassWeapons);   
        this.finalComposer.addPass(shaderPassWholeScreen); 
        this.finalComposer.addPass(shaderPassLevel); 
        this.finalComposer.addPass(outputPass);

        this.update3DRenderPipeline(scene);

    }


    //-------------------------------- limit bloom to targeted object


    public static setSelectiveBloom(bloomStrength: number, objectName: string, type: string = 'weapon'): void
    {
        if (type === 'weapon')
            this.unrealBloomPassWeapons.strength = bloomStrength;

        if (type === 'level')
            this.unrealBloomPassLevel.strength = bloomStrength;

        if (!this.bloomObjects.includes(objectName))
            this.bloomObjects.push(objectName);
    }


    //-------------------------------- traverse scene objects to apply bloom materials / unreal bloom pass material exclusion
    

    private static traverseObjects (scene: Scene3D, layer: THREE.Layers, action?: boolean): void
    { 
        if (this.bloomObjects.length > 0 && scene.third)
            scene.third.scene.traverse(obj => { 
                //@ts-ignore
                if (!layer.test(obj.layers) && !obj.name.includes(...this.bloomObjects))
                    if (obj.type === 'Object3D' || 
                        obj.type === 'SkinnedMesh' || 
                        obj.type === 'Group' || 
                        obj.type === 'Mesh' || 
                        obj.type === 'Points') 
                    {
                        const mesh = obj as THREE.Mesh & THREE.Points;

                        if (action) {
                            this.materials[obj.uuid] = mesh.material;
                            mesh.material = this.baseMaterial;
                            return;   
                        }
                    
                        mesh.material = this.materials[obj.uuid];
                        delete this.materials[obj.uuid]; 
                    }
            });
    }


    //-------------------------------- call animation frame and post processing


    private static update3DRenderPipeline(scene: Scene3D): void
    {
        if (!scene.third) 
            return;

        requestAnimationFrame(() => {
            if (scene.third) { 
                this.bloomComposerWeapons?.setSize(innerWidth, innerHeight);
                this.bloomComposerWholeScreen?.setSize(innerWidth, innerHeight);
                this.bloomComposerLevel?.setSize(innerWidth, innerHeight);
                this.finalComposer?.setSize(innerWidth, innerHeight);
            }

            this.update3DRenderPipeline(scene);
        });

        //render selective bloom passes

        if (this.bloomObjects.length > 0)
        {
            //weapons (muzzle flash)

            this.traverseObjects(scene, this.bloomLayerWeapons, true); 
            this.bloomComposerWeapons.render();
            this.traverseObjects(scene, this.bloomLayerWeapons);
            scene.third.renderer.clearDepth();

            //level objects

            this.traverseObjects(scene, this.bloomLayerLevel, true); 
            this.bloomComposerLevel.render();
            this.traverseObjects(scene, this.bloomLayerLevel);
            scene.third.renderer.clearDepth();
        }

        //render bloom pass to entire scene

        if (this.postProcessingWholeScene) {
            scene.third.renderer.clearDepth();
            this.bloomComposerWholeScreen.render();
            scene.third.renderer.clearDepth();
        }

        //render shader passes

        if (this.postProcessingWholeScene || this.bloomObjects.length > 0)
            this.finalComposer.render(); 
    }
    
}


