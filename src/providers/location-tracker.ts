import {Injectable, NgZone} from '@angular/core';
import 'rxjs/add/operator/map';
// import {BackgroundGeolocation} from '@ionic-native/background-geolocation'
import {Geolocation, Geoposition} from '@ionic-native/geolocation';

type Callback = (waypoint: Waypoint, waypoints?: Array<Waypoint>) => any;

export interface Waypoint extends Coordinates {
    timestamp: number;
}

@Injectable()
export class LocationTracker {

    public watch: any;
    public lat: number = 0;
    public lng: number = 0;

    public callbacks: Array<Callback> = [];
    public isTracking: boolean = false;
    public hasSignal: boolean = false;
    public waypoints: Array<Waypoint> = [];

    constructor (public zone: NgZone,
                 private geolocation: Geolocation
                 //             private backgroundGeolocation: BackgroundGeolocation
    ) {
    }

    watchPosition () {
        // const config = {
        //     desiredAccuracy: 0,
        //     stationaryRadius: 20,
        //     distanceFilter: 10,
        //     debug: true,
        //     interval: 2000
        // };

        // this.backgroundGeolocation.configure(config).subscribe((location) => {
        //     console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
        //
        //     this.zone.run(() => this.updatePosition(location));
        // }, err => console.log(err));
        //
        // this.backgroundGeolocation.start();

        const options = {
            maximumAge: 0,
            enableHighAccuracy: true
        };

        this.watch = this.geolocation.watchPosition(options)
            .subscribe((position: Geoposition) => {
                this.zone.run(() => this.updatePosition(position.coords));
            });
    }

    updatePosition (coords) {
        if (coords === undefined) {
            return this.hasSignal = false;
        }

        this.hasSignal = true;

        this.lat = coords.latitude;
        this.lng = coords.longitude;

        const waypoint: Waypoint = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            altitude: coords.altitude,
            accuracy: coords.accuracy,
            speed: coords.speed,
            heading: coords.heading,
            altitudeAccuracy: coords.altitudeAccuracy,
            timestamp: Math.ceil(+Date.now() / 1000)
        };

        if (this.isTracking) {
            this.waypoints.push(waypoint);
            console.log('recording', this.waypoints);
        }

        this.callbacks.forEach(c => c(waypoint, this.waypoints));
    }

    startTracking () {
        this.waypoints = [];
        this.isTracking = true;
    }

    stopTracking () {
        this.isTracking = false;
        return this.waypoints;
    }

    onPositionUpdate (callback: Callback) {
        this.callbacks.push(callback);
    }

    unwatchPosition () {
        console.log('unwatchPosition');
        // this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }

    getCurrentPosition () {
        return {latitude: this.lat, longitude: this.lng};
    }

}
