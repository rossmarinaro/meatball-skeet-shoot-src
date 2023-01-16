import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../../internals/Config';
import { Actor } from '../Actor';

export async function Room (scene: ENABLE3D.Scene3D): Promise<Readonly<void>>
{

    scene['lighting'] = new System.Process.app.ThirdDimension.Lighting(scene, 55, 20, 55, -20, 1.6, 0.6);

    new Actor(scene, 'meatball_mountains', true, true);

    const loader = new ENABLE3D.THREE.CubeTextureLoader(),
            texture = loader.load([
                'assets/backgrounds/pixel.png',
                'assets/backgrounds/pixel.png',
                'assets/backgrounds/pixel.png',
                'assets/backgrounds/pixel.png',
                'assets/backgrounds/pixel.png',
                'assets/backgrounds/pixel.png'
            ]);

    scene.third.heightMap.scene.background = texture;
}