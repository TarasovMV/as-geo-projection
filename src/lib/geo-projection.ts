import * as proj4 from 'proj4';
import * as isObject from 'lodash.isobject';
import * as isNumber from 'lodash.isnumber';

export interface IGeoProjectionDefault<T extends IGeoProjectionFlat | IGeoProjectionWGS> {
    lt: T;
    lb: T;
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
    private defaultWGS: IGeoProjectionDefault<IGeoProjectionWGS> = {
        lt: {latitude: 55.098425, longitude: 73.119817},
        lb: {latitude: 55.033588, longitude: 73.171238},
        rb: {latitude: 55.065022, longitude: 73.294963},
    }
    private defaultFlat: IGeoProjectionDefault<IGeoProjectionFlat> = undefined;
    private defaultFlatRot: IGeoProjectionDefault<IGeoProjectionFlat> = undefined;
    private sin: number = undefined;
    private cos: number = undefined;
    private delta: IGeoProjectionFlat = undefined;

    constructor() {
        this.setBorders(this.defaultWGS);
    }

    public setBorders(wgs: IGeoProjectionDefault<IGeoProjectionWGS>): void {
        this.defaultWGS = wgs;
        this.defaultFlat = {
            lt: toFlat(wgs.lt),
            lb: toFlat(wgs.lb),
            rb: toFlat(wgs.rb),
        };
        const dx = this.defaultFlat.lb.x - this.defaultFlat.lt.x;
        const dy = this.defaultFlat.lt.y - this.defaultFlat.lb.y;
        const gip = Math.sqrt(dx * dx + dy * dy);
        const sin = -dx / gip;
        const cos = dy / gip;
        this.sin = sin;
        this.cos = cos;

        this.defaultFlatRot = {
            lt: {
                x: this.defaultFlat.lt.x * cos - this.defaultFlat.lt.y * sin,
                y: this.defaultFlat.lt.x * sin + this.defaultFlat.lt.y * cos,
            },
            lb: {
                x: this.defaultFlat.lb.x * cos - this.defaultFlat.lb.y * sin,
                y: this.defaultFlat.lb.x * sin + this.defaultFlat.lb.y * cos,
            },
            rb: {
                x: this.defaultFlat.rb.x * cos - this.defaultFlat.rb.y * sin,
                y: this.defaultFlat.rb.x * sin + this.defaultFlat.rb.y * cos,
            },
        };
        this.delta = {
            x: this.defaultFlatRot.rb.x - this.defaultFlatRot.lt.x,
            y: this.defaultFlatRot.lt.y - this.defaultFlatRot.rb.y,
        };
    }

    public getRelativeByWgs(wgs: IGeoProjectionWGS): IGeoProjectionFlat {
        const flat = toFlat(wgs);
        const flatRot = {
            x: flat.x * this.cos - flat.y * this.sin,
            y: flat.x * this.sin + flat.y * this.cos,
        };
        return {
            x: (flatRot.x - this.defaultFlatRot.lt.x) / this.delta.x * 100,
            y: (flatRot.y - this.defaultFlatRot.rb.y) / this.delta.y * 100,
        };
    }

    public getRelativeByFlat(flat: IGeoProjectionFlat): IGeoProjectionFlat {
        const flatRot = {
            x: flat.x * this.cos - flat.y * this.sin,
            y: flat.x * this.sin + flat.y * this.cos,
        };
        return {
            x: (flatRot.x - this.defaultFlatRot.lt.x) / this.delta.x * 100,
            y: (flatRot.y - this.defaultFlatRot.rb.y) / this.delta.y * 100,
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
    };
    const projected = proj4.default('WGS84', defaultProjection, proj4coordinates);
    return ({
        x: projected.x,
        y: projected.y
    });
}
