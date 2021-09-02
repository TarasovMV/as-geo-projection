import * as proj4 from 'proj4';
import * as isObject from 'lodash.isobject';
import * as isNumber from 'lodash.isnumber';

export interface IGeoProjectionDefault<T extends IGeoProjectionFlat | IGeoProjectionWGS> {
    lt: T;
    rb: T;
}

export interface IGeoProjectionFlat {
    x: number;
    y: number;
}

export interface IGeoProjectionWGS {
    longitude: number;
    latitude: number;
}

export class GeoProjection {
    // private defaultWGS: IGeoProjectionDefault<IGeoProjectionWGS> = {
    //     lt: {latitude: 55.0982678796, longitude: 73.1202739448},
    //     rb: {latitude: 55.0643063117, longitude: 73.2950520486},
    // }

    private defaultFlat: IGeoProjectionDefault<IGeoProjectionFlat> = {
        lt: {
            x: 8139711.6621998055,
            y: 7380961.309697426,
        },
        rb: {
            x: 8159167.871716635,
            y: 7374356.672722412,
        },
    }

    constructor() {}

    public setBorders(config: { wgs: IGeoProjectionDefault<IGeoProjectionWGS>, flat: IGeoProjectionDefault<IGeoProjectionFlat>}): void {
        this.defaultFlat = config.flat;
        // this.defaultWGS = config.wgs;
    }

    public getRelativeByWgs(wgs: IGeoProjectionWGS): IGeoProjectionFlat {
        const flat = toFlat(wgs);
        const delta = {
            x: this.defaultFlat.rb.x - this.defaultFlat.lt.x,
            y: this.defaultFlat.lt.y - this.defaultFlat.rb.y,
        };
        return {
            x: (flat.x - this.defaultFlat.lt.x) / delta.x * 100,
            y: (flat.y - this.defaultFlat.rb.y) / delta.y * 100,
        };
    }
}

const defaultProjection: string = 'GOOGLE';

/**
 * @description Function return flat WGS coords by flat Gauss-Krueger
 * @param coordinates - Flat coordinates
 * @returns IGeoProjectionWGS
 */
export const toWGS = (coordinates: IGeoProjectionFlat): IGeoProjectionWGS => {
    if (!isObject(coordinates) || !isNumber(coordinates.x) || !isNumber(coordinates.y)) {
        throw new Error('missing or invalid parameter `coordinates`')
    }
    if (coordinates.x < 0 || coordinates.x >= Math.pow(10, 7)) {
        throw new Error('`coordinates.x` out of bounds')
    }
    if (coordinates.y < 0 || coordinates.y >= Math.pow(10, 7)) {
        throw new Error('`coordinates.y` out of bounds')
    }
    const projected = proj4.default(defaultProjection, 'WGS84', Object.assign({}, coordinates))
    return ({
        longitude: projected.x,
        latitude: projected.y
    })
}

/**
 * @description Function return flat WGS coords by flat Gauss-Krueger
 * @param coordinates - WGS coordinates
 * @returns IGeoProjectionFlat
 */
export const toFlat = (coordinates: IGeoProjectionWGS): IGeoProjectionFlat => {
    if (!isObject(coordinates) || !isNumber(coordinates.longitude) || !isNumber(coordinates.latitude)) {
        throw new Error('missing or invalid parameter `coordinates`')
    }
    if (coordinates.longitude < -180 || coordinates.longitude > 180) {
        throw new Error('`coordinates.longitude` out of bounds')
    }
    if (coordinates.latitude < -360 || coordinates.latitude > 360) {
        throw new Error('`coordinates.latitude` out of bounds')
    }
    const proj4coordinates = {
        x: coordinates.longitude,
        y: coordinates.latitude
    }
    const projected = proj4.default('WGS84', defaultProjection, proj4coordinates)
    return ({
        x: projected.x,
        y: projected.y
    })
}
