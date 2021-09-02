# as-geo-projection

Typescript module for biderectional converting Gauß-Krüger-coordinates into WGS84 latitide and longitude. Using zone: GOOGLE(EPSG:3857).

##Usage

###Functions
```typescript
import {toFlat, toWGS} from "as-geo-projection";

let wgs84 = toWGS({x: 4591270, y: 5819620}) // {longitude: 13.34255019849783, latitude: 52.50210050984162}
let gk = toFlat({longitude: 13.4, latitude: 52.5}) // {x: 4595175.488530577, y: 5819460.402152777}
```

###Class
```typescript
import {GeoProjection} from "as-geo-projection";

const geo = new GeoProjection();
geo.setBorders({
  wgs: {
    lt: {latitude: 55.0982678796, longitude: 73.1202739448},
    rb: {latitude: 55.0643063117, longitude: 73.2950520486},
  },
  flat: {
    lt: {x: 8139711.6621998055, y: 7380961.309697426,},
    rb: {x: 8159167.871716635, y: 7374356.672722412,},
  },
});
const res = geo.getRelativeByWgs({latitude: 55.0982678796, longitude: 73.2202739448});
```

###Default borders (use if not set borders)
```typescript
geo.setBorders({
    wgs: {
        lt: { latitude: 55.0982678796, longitude: 73.1202739448 },
        rb: { latitude: 55.0643063117, longitude: 73.2950520486 },
    },
    flat: {
        lt: { x: 8139711.6621998055, y: 7380961.309697426, },
        rb: { x: 8159167.871716635, y: 7374356.672722412, },
    }
};
```
