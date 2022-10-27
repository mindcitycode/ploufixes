export const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
export const FLIPPED_VERTICALLY_FLAG = 0x40000000;
export const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
export const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;

const throwTypeError = (property, type, gid) => {
    throw new Error(`tile property "${property.name}" have wrong type "${property.type}" in tile gid ${gid}, should be "${type}"`)
}
const throwTypeValueError = (property, type, gid) => {
    throw new Error(`tile property "${property.name}" have value "${property.value}" of wrong type in tile gid ${gid}, type should be "${type}"`)
}
const throwUnknownPropertyError = (property, gid) => {
    throw new Error(`unknwon tile property "${property.name}" in tile gid ${gid}`)
}
const assertPropertytype = (property, type, gid) => {
    if (property.type !== type) throwTypeError(property, type, gid)
}
export const parsePropertyValue = (property, type, gid) => {
    assertPropertytype(property, type, gid)
    switch (type) {
        case 'bool': {
            if (property.value === true) return true
            if (property.value === false) return false
            throwTypeValueError(property, type, gid)
        }
        case 'string': return property.value.toString();
        case 'int': {
            const v = parseInt(property.value)
            if (isNaN(v)) throwTypeValueError(property, type, gid)
            return v
        }
    }
}
export const parseTileProperties = (propertyList, gid) => {
    const properties = { gid }
    for (let propertyIndex = 0; propertyIndex < propertyList.length; propertyIndex++) {
        const property = propertyList[propertyIndex]
        switch (property.name) {
            case 'obstacle': {
                properties.obstacle = parsePropertyValue(property, 'bool', gid)
                break;
            }
            default: {
                throwUnknownPropertyError(property, gid)
            }
        }
    }
    return properties
}

export const parseTilesProperties = tilemapData => {
    // all tilemap tilesets tiles properties by gid
    const tilesProperties = []
    for (let tilesetIndex = 0; tilesetIndex < tilemapData.tilesets.length; tilesetIndex++) {
        const tilesetData = tilemapData.tilesets[tilesetIndex]
        for (let tilePropertiesIndex = 0; tilePropertiesIndex < tilesetData.tiles.length; tilePropertiesIndex++) {
            const tileProperties = tilesetData.tiles[tilePropertiesIndex]
            const gid = tilesetData.firstgid + tileProperties.id
            tilesProperties[gid] = {
                parsed: parseTileProperties(tileProperties.properties, gid),
                raw: tileProperties.properties
            }
        }
    }
    return tilesProperties
}