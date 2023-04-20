/* COMMON UTILS */

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from './Config';

export default class Utils {

    
    public static numbers = {

        multiplyDecimals: function (a: number, b: number): number
        { 
            return (a * 10 + b * 10);
        },
        inRange: function(x: number, a: number, b: number): boolean
        { 
            return x >= a && x <= b; 
        },
        clamp: function (x: number, a: number, b: number): number 
        {
            return Math.min(Math.max(x, a), b);
        },
        lerp: function (x: number, a: number, b: number): number
        {
            return x * (b - a) + a;
        }
        
    }

    public static strings = {

        
        getFileType: function (path: string): string
        {      
            return String(path.split('.').pop());
        },

        getFilePathByKey: async function (key: string, manifest: string, type: string): Promise<string> 
        {
            return new Promise(res => {   

                let i = 0;

                const cache = System.Process.game.scene.getScene('Boot').cache.json.get(manifest)[type];

                cache.filter(async (resource: Object) => {

                    i++;
                    
                    if (String(Object.keys(resource)[0]) === key)
                        res(String(Object.values(resource)[0]));
                        
                    else if (i >= cache.length) 
                        res("No asset found.");
                });
            })
        },

        joinWithUnderscore: function (a: string, b: string): string
        {
            return a += `_${b}`;
        },

        replaceUnderscore: function(str: any): string
        {
            let strArr: string[] = [];
            for(let i = 0; i < str.length; i++)
                strArr.push(str[i]);          
            return strArr.includes('_') ? str.toString().replaceAll('_', ' ') : str;
        },

        removeUnderscore: function(str: any): string
        {
            let strArr: string[] = [];
            for(let i = 0; i < str.length; i++)
                strArr.push(str[i]);          
            return strArr.includes('_') ? str.toString().replaceAll('_', '') : str;
           
        },

        removeStringPart: async function(str: string, part: string): Promise<string>
        {      
           return str.toString().replace(part, '');
        },

        removeNumbers: async function(str: string): Promise<string>
        {      
            const strArr: string[] = [],
                  numArr: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

            for(let char = 0; char < str.length; char++)
                strArr.push(str[char]); 
                    
            const check = async ()=> {
                for(let char = 0; char < strArr.length; char++)
                    if (numArr.includes(strArr[char].toString()))
                    {
                        let _string = strArr.filter(i => isNaN(parseInt(i)));  
                        return _string.join('');
                    }
                    return str;
            }
            const newStr = await check();

            return newStr;
     
        },

        removeJunk: async function(str: any): Promise<string>
        {
            const 
            rmvUnderscore = this.replaceUnderscore(str),
            rmvNumbers = await this.removeNumbers(rmvUnderscore),
            newStr = await this.removeStringPart(rmvNumbers, 'tile');

            return newStr;
        },

        checkSpace: async function(str: string): Promise<string>
        {  
            return str.includes(' ') ? str.replace(' ', '') : str;
        },
        
        checkVowel: async function(str: string): Promise<string>
        {
            const 
                vowels = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u'],
                firstChar = str[0];

            let result = vowels.includes(firstChar) ? 'an ' : 'a ';

            if (str.endsWith('s')) //if plural, return empty character
                result = '';

            return result;
        }
    }
        
    
    //------------------------------------ find nearest 3d mesh


    public static async getNearestBone(

        meshA: ENABLE3D.ExtendedMesh, 
        meshB: ENABLE3D.ExtendedMesh, 
        key: string

    ): Promise<Readonly<{bone: Object, pos: number}> | null>
    {

        const 

           bonesA = meshA?.children.filter((i: ENABLE3D.THREE.Object3D) => i instanceof ENABLE3D.THREE.Bone),
           bonesB = meshB?.children.filter((i: ENABLE3D.THREE.Object3D) => i instanceof ENABLE3D.THREE.Bone),
           bones: any[] = [];
           
        if (bonesA && bonesB)
        { 
            bonesA?.map((i: ENABLE3D.THREE.Object3D) => i.children.map((bone: ENABLE3D.THREE.Object3D) => bones.push( { bone, worldPos: bone?.getWorldPosition(new ENABLE3D.THREE.Vector3()) } )));

            let worldPos = bonesB?.map((i: ENABLE3D.THREE.Object3D) => i.children.map((bone: ENABLE3D.THREE.Object3D) => {
                    if (bone.name === key)
                        return bone?.getWorldPosition(new ENABLE3D.THREE.Vector3());
                }));
                
            if (worldPos[0][0])
            {
                let arr: any[] = [],
                    getSum = (i: any) => { return i.x + i.y + i.z; };

                bones.forEach((bone: ENABLE3D.THREE.Object3D) => arr.push({bone: bone['bone'], pos: getSum(bone['worldPos'])}));

                let bone = arr.reduce((prev, curr) => prev.pos < curr.pos ? prev : curr);   

                return bone;
            }
        }

        return null;
    }

    //--------------------------------------------------- get dot product of two vectors in 3d space

    public static getDotProduct(

        actorA: ENABLE3D.ExtendedMesh, 
        actorB: ENABLE3D.ExtendedMesh
        
    ): Readonly<number>
    {
 
        const posA = actorA.position,
              posB = actorB.position,
              vecA = new ENABLE3D.THREE.Vector3(posA.x, posA.y, posA.z),
              vecB = new ENABLE3D.THREE.Vector3(posB.x, posB.y, posB.z), 

              vecA_length = Math.sqrt(vecA.x * vecA.x + vecA.y * vecA.y + vecA.z * vecA.z), 
              vecB_length = Math.sqrt(vecB.x * vecB.x + vecB.y * vecB.y + vecB.z * vecB.z), 
        
              inverse_length_vecA = 1 / vecA_length, 
              inverse_length_vecB = 1 / vecB_length, 
        
              unit_vecA = new ENABLE3D.THREE.Vector3(vecA.x * inverse_length_vecA, vecA.y * inverse_length_vecA, vecA.z * inverse_length_vecA), 
              unit_vecB = new ENABLE3D.THREE.Vector3(vecB.x * inverse_length_vecB, vecB.y * inverse_length_vecB, vecB.z * inverse_length_vecB), 
        
              dotProduct = (unit_vecA.x * unit_vecB.x) + (unit_vecA.y * unit_vecB.y) + (unit_vecA.z * unit_vecB.z);

        return dotProduct;

    }

    //------------------------------------------------

    public static getCrossProduct(

        actorA: ENABLE3D.ExtendedMesh, 
        actorB: ENABLE3D.ExtendedMesh
        
    ): Readonly<ENABLE3D.THREE.Vector3>
    {
        const posA = actorA.position,
              posB = actorB.position;

        return new ENABLE3D.THREE.Vector3(
                posA.y * posB.z - posA.z * posB.y, 
                posA.z * posB.x - posA.x * posB.z, 
                posA.x * posB.y - posA.y * posB.x
            ); 
    }
    
}