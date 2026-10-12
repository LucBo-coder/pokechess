const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/visual/manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
function dimensions(file) {
    const data = fs.readFileSync(file);
    assert.equal(data.subarray(1, 4).toString(), 'PNG', file);
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
}
const ids = new Set();
for (const asset of manifest.assets) {
    assert.ok(!ids.has(asset.id), asset.id); ids.add(asset.id);
    assert.deepEqual(dimensions(path.join(root, asset.path)), asset.derived_dimensions, asset.id);
    const source = path.join(root, 'asset-packs/staging', asset.source_pack, asset.source_file);
    assert.deepEqual(dimensions(source), asset.source_dimensions, asset.id);
    const [x,y,w,h] = asset.crop_rectangle;
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x+w <= asset.source_dimensions[0] && y+h <= asset.source_dimensions[1], asset.id);
    if (asset.nine_slice) {
        const [l,t,r,b] = asset.nine_slice;
        assert.ok(l+r < asset.derived_dimensions[0] && t+b < asset.derived_dimensions[1], asset.id);
    }
}
const css = fs.readFileSync(path.join(root,'css/battle_visual.css'),'utf8');
for (const [,url] of css.matchAll(/url\('([^']+)'\)/g)) assert.ok(fs.existsSync(path.resolve(root,'css',url)), url);
const items = JSON.parse(fs.readFileSync(path.join(root,'docs/visual/item-icon-sources.json'),'utf8'));
for (const [name, source] of Object.entries(items)) {
    assert.ok(fs.readFileSync(path.join(root,'assets/items',name)).equals(fs.readFileSync(path.join(root,source))), name);
}
console.log(`Verified ${ids.size} visual PNGs, all CSS asset URLs, source crops/dimensions and ${Object.keys(items).length} unchanged local item icons.`);
