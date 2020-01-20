/**
 *  Copyright © 2019 Province of British Columbia
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * 	Unless required by applicable law or agreed to in writing, software
 * 	distributed under the License is distributed on an "AS IS" BASIS,
 * 	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 	See the License for the specific language governing permissions and
 * 	limitations under the License.
 *
 * 	Created by Amir Shayegh on 2019-10-23.
 */
import { TestBed } from '@angular/core/testing';
import * as hexTest from './hexTest.json';
import * as insideOutsideTest from './insideOutsideTest.json';

import { ConverterService } from './location.service';

describe('ConverterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  // it('should be created', () => {
  //   const service: ConverterService = TestBed.get(ConverterService);
  //   expect(service).toBeTruthy();
  // });

  // it('should produce correct hex id - 1', () => {
  //   const service: ConverterService = TestBed.get(ConverterService);
  //   const latitude = 53.615360;
  //   const longitude  = -132.306680;
  //   const hexID = 53615432307;
  //   const strataID = 967;
  //   const x = service.getHexId(longitude, latitude);
  //   let passed = true;
  //   if (hexID - 1001 != x.target.BCHexID) {
  //     passed = false;
  //   }
  //   if (strataID != x.strataID) {
  //     passed = false;
  //   }
  //   expect(passed).toBeTruthy();
  // });

  it('should produce correct hex ids', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const obj = JSON.parse(JSON.stringify(hexTest)).default;
        let success = 0;
        let fail = 0;
        for (const item of obj) {
          const x = service.getHexId(item.latitude, item.longitude);
          let passed = true;
          if (item.hexID != x.cc) {
            passed = false;
          }
          // if (item.strataID != x.strataId) {
          //   passed = false;
          // }
          if (!passed) {
            fail++;
            console.log(`\n***`);
            console.log(`expected hexID: ${item.hexID}`);
            console.log(`received hexID: ${x.cc}`);
            // break;
          } else {
            success ++;
          }
        }
        console.log(`\n******\nHex conversion:`);
        console.log(`passed: ${success}`);
        console.log(`failed: ${fail}`);
    expect(fail).toBeLessThan(1);
  });

  it('should correctly indicate if a coordinate is inside or outside BC', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const obj = JSON.parse(JSON.stringify(insideOutsideTest)).default;
        let success = 0;
        let fail = 0;
        for (const item of obj) {
          const isIn = service.isInsideBC(item.latitude, item.longitude);
          const passed = (isIn === item.inside) ;
          if (!passed) {
            fail++;
            console.log(`\n***`);
            console.log(`${item.longitude} , ${item.latitude} should be inside: ${item.inside}, but result is: ${isIn}`);
          } else {
            success ++;
          }
        }
        console.log(`\n******\nInside Outside:`);
        console.log(`passed: ${success}`);
        console.log(`failed: ${fail}`);
    expect(fail).toBeLessThan(1);
  });
  it('should Convert from Lat Long to Albers', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const longitude = -119.472548;
    const latitude = 49.905577;
    const albersX = 1468294.70085;
    const albersY = 564887.24757;
    const roundTo = 3;
    const latLongToAlbers = service.latLongCoordinateToAlbers(latitude, longitude)
    const successful = (latLongToAlbers.x.toFixed(roundTo) === albersX.toFixed(roundTo) && latLongToAlbers.y.toFixed(roundTo) === albersY.toFixed(roundTo));
    if (!successful) {
      console.log(`**** latLong To Albers`);
      console.log(latLongToAlbers);
    }
    expect(successful).toBeTruthy();
  });
  it('should Convert from Albers to Lat Long', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const longitude = -119.472548;
    const latitude = 49.905577;
    const albersX = 1468294.70085;
    const albersY = 564887.24757;
    const roundTo = 3;
    const albersToLatLong = service.albersToLatLongCoordinate(albersX, albersY);
    const successful = (albersToLatLong.latitude.toFixed(roundTo) === latitude.toFixed(roundTo) && albersToLatLong.longitude.toFixed(roundTo) === longitude.toFixed(roundTo));
    if (!successful) {
      console.log(`**** albers To LatLong`);
      console.log(albersToLatLong);
    }
    expect(successful).toBeTruthy();
  });
  it('should Convert from lat long to UTM', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const longitude = -119.472548;
    const latitude = 49.905577;
    const UTMx = 322462.246733;
    const UTMy = 5531063.683699;
    const utmZone = 11;
    const latLongToUTM = service.convertLatLongCoordinateToUTM(latitude, longitude);
    const successful = (latLongToUTM.eastings.toFixed() === UTMx.toFixed() && latLongToUTM.northings.toFixed() === UTMy.toFixed() && latLongToUTM.zone === utmZone);
    if (!successful) {
      console.log(`**** latLong To UTM`);
      console.log(latLongToUTM);
      console.log(`Should be:` + UTMx.toFixed() + ` ` + UTMy.toFixed());
      console.log(`Is:` + latLongToUTM.eastings.toFixed() + ` ` + latLongToUTM.northings.toFixed());
    }
    expect(successful).toBeTruthy();
  });
  it('should Convert from UTM to Lat Long', () => {
    const service: ConverterService = TestBed.get(ConverterService);
    const longitude = -119.472548;
    const latitude = 49.905577;
    const UTMx = 322462.246733;
    const UTMy = 5531063.683699;
    const utmZone = 11;
    const roundTo = 3;
    const UTMtoLatLong = service.convertUTMToLatLongCoordinate(UTMx, UTMy, utmZone)
    const successful = (UTMtoLatLong.latitude.toFixed(roundTo) === latitude.toFixed(roundTo) && UTMtoLatLong.longitude.toFixed(roundTo) === longitude.toFixed(roundTo));
    if (!successful) {
      console.log(`**** UTM to LatLong`);
      console.log(UTMtoLatLong);
    }
    expect(successful).toBeTruthy();
  });
});
