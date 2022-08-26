
import { showNotification } from '@mantine/notifications';
import { createDecipheriv, createCipheriv, randomBytes } from 'crypto';

const HEIGHT = 12;
const BUCKET_SIZE = 4;
const LEAVES_COUNT = 2 ** (HEIGHT - 1);
const NODE_COUNT = ((2 ** HEIGHT) - 1);
const BLOCK_COUNT = NODE_COUNT * BUCKET_SIZE;

const SECRET = randomBytes(32);


type operationsTypes = "read" | "write" | "delete";
const positionMap: Map<string, {leaf: number, height: number, offset: number, block: number}> = new Map();
initServer();

function encrypt(text: string) {
    let iv = randomBytes(16);
    let cipher = createCipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
   
function decrypt(text: {iv: string, encryptedData: string}) : string {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = createDecipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// An encrypt function
function encryptString(text: string): string {
    
    let enc = encrypt(text);
    // Returning iv and encrypted data
    return `${enc.encryptedData}:${enc.iv}`;

}
  
// A decrypt function
function decryptString(text: string): string {

    let splitted = text.split(':');
    
    // returns data after decryption
    return decrypt({encryptedData: splitted[0], iv: splitted[1]});
}

async function initServer(){

    // set free blocks 
    for(let i = 0; i < NODE_COUNT; i++)
        await setNode(i, Array.from([encryptString('dummy'), encryptString('dummy'), encryptString('dummy'), encryptString('dummy')]));

    test();

}

async function test(){

    var startTime = performance.now()
    
    await access("write", '111', '111111');
    await access("write", '222', '222222');
    await access("write", '333', '333333');
    await access("write", '444', '444444');
    await access("write", '555', '555555');
    await access("read", '111', '555555');
    await access("read", '222', '555555');
    await access("read", '333', '555555');
    await access("read", '444', '555555');
    await access("read", '555', '555555');
    await access("delete", '111', '555555');
    await access("read", '222', '555555');
    await access("read", '333', '555555');
    await access("read", '444', '555555');
    await access("read", '555', '555555');

    var endTime = performance.now()

    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
}

async function getNode(nodeNum: number): Promise<Array<string>> {

    let serverData = await fetch(`/getNode?nodeNum=${nodeNum}`);
    let { data } = await serverData.json();
    return data;   

}

async function setNode(nodeNum: number, data: Array<string>): Promise<void> {

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "nodeNum": nodeNum, "data": data })
        };

    await fetch(`/setNode`, requestOptions);  

}

function right(nodeNum: number): number {
    return (nodeNum * 2) + 2;
}

function left(nodeNum: number): number {
    return (nodeNum * 2) + 1;
}

async function getPath(leaf: number) : Promise<Array<Array<string>>> {

    let instructions = [...(leaf >> 0).toString(2).padStart(HEIGHT - 1, "0")];

    let path = new Array<Array<string>>();
    let root = await getNode(0);
    path.push(root);

    let parent = 0;
    for (let i = 0; i < instructions.length; i++){

        parent = instructions[i] == "1"? right(parent): left(parent);
        path.push(await getNode(parent));

    }

    return path;

}

async function setPath(leaf: number, path: Array<Array<string>>) : Promise<void> {

    let instructions = [...(leaf >> 0).toString(2).padStart(HEIGHT - 1, "0")];

    await setNode(0, path[0]);

    let parent = 0;
    for (let i = 0; i < instructions.length; i++){

        parent = instructions[i] == "1"? right(parent): left(parent);
        await setNode(parent, path[i + 1]);

    }

}

function fixPositionMap(baseLeaf: number, baseHeight: number, baseOffset: number ){

    let instructions = [...(baseLeaf >> 0).toString(2).padStart(HEIGHT - 1, "0")];

    let bucket = 0;
    let nextBucket = 0;
    let positionMapCopy = new Map<string, {leaf: number, height: number, offset: number, block: number}>(JSON.parse(JSON.stringify(Array.from(positionMap))));

    // for any bucket, fix the position map.
    for (let i = 0; i < baseHeight + 1; i++) {

        nextBucket = instructions[i] == '1'? right(bucket): left(bucket);
        for (let [key, {leaf, height, offset, block}] of positionMapCopy){

            let curBucket = Math.floor(block / BUCKET_SIZE);
            if (curBucket == bucket){

                if (height != baseHeight || offset <= baseOffset)
                positionMap.set(key, {
                    leaf: offset == BUCKET_SIZE - 1? baseLeaf: leaf,
                    height: offset == BUCKET_SIZE - 1? height + 1: height,
                    offset: offset == BUCKET_SIZE - 1? 0: offset + 1,
                    block: offset == BUCKET_SIZE - 1? nextBucket * 4: block + 1
                });        
                
            }

        }
        
        // get next block
        bucket = nextBucket;
    }
}

function mixPath(path: Array<Array<string>>, position: number, offset: number){
    
    let newPath: Array<Array<string>> = new Array<Array<string>>();
    // let newPath: Array<Array<string>> = Array.apply(new Array<string>(BUCKET_SIZE), Array(HEIGHT));

    // set new root.
    let curBucket: Array<string> = new Array();

    curBucket.push(path[position][offset]);

    path.forEach((node, index) => {

        node.forEach((block, curOffset) => {

            // pushing all blocks except the original.
            if (index != position || index == position && curOffset != offset){
                curBucket.push(block);
                // if(curBucket.length == 1){
                //     [...positionMap.values()].filter(prop => prop.block)
                // }
                if(curBucket.length == 4){
                    newPath.push(curBucket);
                    curBucket = new Array();
                }
            }
        });

    });

    return newPath;

}

export async function access(op: operationsTypes , key: string, data: string): Promise<string | null> {
    
    try {

        // conf.
        let { leaf, height, offset, block } = op == "write"? getFreeBlock(): positionMap.get(key)?? {leaf: -1, height: -1, offset: -1, block: -1};
        if (leaf < 0)
            return null;

        // overflow take care.
        if(op == "write" && positionMap.size >= BLOCK_COUNT){
            showNotification({ 
                color: "red",
                title: "Overflow!",
                message: "You have too many data, please remove some data for saving new data.",
              });
    
            return null;
        }

        if (op == "delete"){
            positionMap.delete(key);
            return '';
        }

        // get needed path.
        let path: Array<Array<string>> = await getPath(leaf);

        // dec path
        let decPath = [];
        for(let bucket of path){
            let decBucket = [];
            for(let block of bucket)
                decBucket.push(decryptString(block));
            decPath.push(decBucket);
        }
        path = decPath;

        // do op.
        let reqData = path[height][offset];
        if (op == "write")
            path[height][offset] = data;

        // mix path
        let newPath = mixPath(path, height, offset);

        // enc path
        let encPath = [];
        for(let bucket of newPath){
            let decBucket = [];
            for(let block of bucket)
                decBucket.push(encryptString(block));
            encPath.push(decBucket);
        }
        newPath = encPath;

        // write path to server
        await setPath(leaf, newPath);

        // get random leaf for the root.
        fixPositionMap(leaf, height, offset);
        let randomLeaf = Math.floor(Math.random() * LEAVES_COUNT);
        positionMap.set(key, {leaf: randomLeaf, height: 0, offset: 0, block: 0});

        // return
        return reqData; 
        
    } catch (Error){

        showNotification({ 
            color: "red",
            title: "Error in access operation",
            message: (Error as Error).message,
          });

        return null;
    }

}

function getFreeBlock(): {leaf: number, height: number, offset: number, block: number} {

    let notFreeBlocks = new Set([...positionMap.values()].map(x => x.block));
    let allBlocks = [...Array(BLOCK_COUNT).keys()];
    let freeBlocks = allBlocks.filter(block => !notFreeBlocks.has(block));

    let getRandomLeftOrRight = (leaf: number) => Math.random() > 0.5? left(leaf): right(leaf);

    let randomBlock = Array.from(freeBlocks)[Math.floor(Math.random() * freeBlocks.length)];
    let height = randomBlock < 4? 0: Math.floor(Math.log2((randomBlock / BUCKET_SIZE) + 1));
    let offset = randomBlock % 4;
    
    let curHeight = height;
    let leaf = Math.floor(randomBlock / BUCKET_SIZE);
    while (curHeight < HEIGHT - 1) {
        leaf = getRandomLeftOrRight(leaf);
        curHeight++;
    }

    leaf = leaf - (LEAVES_COUNT - 1);
    
    // the leaf num here is the block leaf number.
    // freeBlocks.delete(randomBlock);
    return {leaf: leaf, height: height, offset: offset, block: randomBlock};
    
}