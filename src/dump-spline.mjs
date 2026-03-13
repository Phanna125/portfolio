import fs from 'fs/promises';

global.window = {}; // Some loaders assume window exists

async function run() {
    try {
        const response = await fetch('https://prod.spline.design/ifwJfSH-kdl2oh5D/scene.splinecode');
        const json = await response.json();
        await fs.writeFile('spline-dump.json', JSON.stringify(json, null, 2));
        console.log("Dumped JSON length: ", JSON.stringify(json).length);
    } catch (e) {
        console.error(e);
    }
}
run();
