import * as ENABLE3D from '@enable3d/phaser-extension'
import { System } from '../../internals/Config'
import chroma from 'chroma-js'
import { Actor } from '../Actor'

export async function Range (scene: ENABLE3D.Scene3D): Promise<Readonly<void>>
{
    return new Promise(async res => {

        const { Lighting } = (await import ('../lighting')),
              { LevelManager3D } = (await import ('../levelManager')),
              { ShaderManager, BloomLayers } = (await (import ('../../shaders/main')));

        Lighting.init(
            scene, 
            new ENABLE3D.THREE.Vector3(0, 55, -20), 
            new ENABLE3D.THREE.Vector3(0, 55, 20), 
            { color: 0xffffff, intensity: 2.5 }, 
            { color: 0x525252, intensity: 1.5 }
        );

        LevelManager3D.makeSkybox(scene, System.Process.app.timeOfDay >= 17 ? 'assets/backgrounds/pixel3.png' : 'assets/backgrounds/pixel2.png');

        //ground 

        const nori = await scene.third.load.texture('nori'),
              texCube = scene.third.misc.textureCube([nori, nori, nori, nori]);

        scene.third.physics.add.box({y: -100, width: 5000, height: 0, depth: 5000, collisionFlags: 2}, {custom: texCube.materials});

        //world bounds

        scene.third.physics.add.box({x: 600, width: 10, height: 1000, depth: 3000, collisionFlags: 2}, {phong: { visible: false }});
        scene.third.physics.add.box({x: -600, width: 10, height: 1000, depth: 3000, collisionFlags: 2}, {phong: { visible: false }});
        scene.third.physics.add.box({z: 600, width: 3000, height: 1000, depth: 10, collisionFlags: 2}, {phong: { visible: false }});
        scene.third.physics.add.box({z: -600, width: 3000, height: 1000, depth: 10, collisionFlags: 2}, {phong: { visible: false }});
        scene.third.physics.add.box({y: 600, width: 3000, height: 10, depth: 3000, collisionFlags: 2}, {phong: { visible: false }});

        const colorScale = chroma
        .scale(['#680702ff', '#311700', '#3d2109', '#351c05', '#5c4127', '#3d1e00', '#473018', '#7a634b', '#855223', '#7a634b'])
        .domain([0, 0.025, 0.15, 0.2, 0.25, 0.5, 1.3, 1.45, 1.8]), 

        heightmap = await scene.third.load.texture('island-heightmap'), 
        mountains1 = scene.third.heightMap.add(heightmap, { colorScale }),
        mountains2 = scene.third.heightMap.add(heightmap, { colorScale }),
        mountains3 = scene.third.heightMap.add(heightmap, { colorScale }),
        mountains4 = scene.third.heightMap.add(heightmap, { colorScale });

        mountains1?.position.set(0, -100, -1370);
        mountains1?.scale.set(300, 100, 300);
        scene.third.add.existing(mountains1);

        mountains2?.position.set(-1370, -100, -100);
        mountains2?.rotateZ(90);
        mountains2?.scale.set(300, 100, 300);
        scene.third.add.existing(mountains2);

        mountains3?.position.set(1370, -100, -100);
        mountains3?.rotateZ(90);
        mountains3?.scale.set(300, 100, 300);
        scene.third.add.existing(mountains3);

        mountains4?.position.set(100, -100, 1370);
        mountains4?.scale.set(300, 100, 300);
        scene.third.add.existing(mountains4);

        //trees

        const trees = [
            new Actor(scene, 'broccoli', 200, -100, -300, true, true),
            new Actor(scene, 'broccoli', 300, -100, -180, true, true),
            new Actor(scene, 'broccoli', -210, -100, 120, true, true)
        ],

        trees2 = [
            new Actor(scene, 'carrot', -400, -100, -140, true, true),
            new Actor(scene, 'carrot', -300, -100, -500, true, true),
            new Actor(scene, 'carrot', 100, -100, -570, true, true),
            new Actor(scene, 'carrot', 400, -100, 450, true, true)
        ];

        trees.forEach(i => i.scale.set(5, 5, 5));
        trees2.forEach(i => i.scale.set(17, 17, 17));

        LevelManager3D.level.traverse(child => { 
            if (child.isMesh) {
                if (child.name.includes('ladder')) 
                    child.visible = false;

                if (child.name.includes('barrier'))
                    child.visible = false;                  
            }

            if (child.name.includes('light') && child.type === 'Mesh') 
            {
                const mesh = child as unknown as ENABLE3D.THREE.Mesh,
                      material = new ENABLE3D.THREE.MeshStandardMaterial({ blending: ENABLE3D.THREE.AdditiveBlending, color: 0xfdffd4, transparent: true, opacity: 0.85 });

                mesh.material = material;
                mesh.material.needsUpdate = true;

                if (System.Process.app.timeOfDay >= 17) { //lights on at night 
                    mesh.layers.enable(BloomLayers.LEVEL);
                    ShaderManager.setSelectiveBloom(2.0, mesh.name, 'level');
                }

            }
        });
        res();
    });

}