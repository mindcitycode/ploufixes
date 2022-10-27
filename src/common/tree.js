import { FLIPPED_DIAGONALLY_FLAG, FLIPPED_HORIZONTALLY_FLAG, FLIPPED_VERTICALLY_FLAG, parseTilesProperties, ROTATED_HEXAGONAL_120_FLAG } from './tilemap.js'
import RBush from 'rbush';


export const instanciateTilemapRTree = async (tilemapData) => {
    // instanciate acceleration structure
    const tree = new RBush()

    const tilesProperties = parseTilesProperties(tilemapData)
    console.log('tilesProperties', tilesProperties)

    for (let layerIndex = 0; layerIndex < tilemapData.layers.length; layerIndex++) {
        const layer = tilemapData.layers[layerIndex]
        for (let i = 0; i < layer.width; i++) {
            for (let j = 0; j < layer.height; j++) {
                const offset = i + j * layer.width
                const v = layer.data[offset]
                const gid = v & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                const x = i * tilemapData.tilewidth
                const y = j * tilemapData.tileheight
                const tileProperties = tilesProperties[gid]
                if (tileProperties) {
                    if (tileProperties.parsed.obstacle) {
                        const item = {
                            minX: x,
                            minY: y,
                            maxX: x + tilemapData.tilewidth,
                            maxY: y + tilemapData.tileheight,
                            tileProperties,
                            layerIndex,
                            offset,
                        };
                        tree.insert(item);
                    }
                }
            }
        }
    }
    return {
        tree,
    }

}
