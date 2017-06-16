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
    public accuracy: number = 0;
    public distance: number = 0;

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
            maximumAge: 3000,
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
        this.accuracy = coords.accuracy;

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
            if (this.waypoints.length > 0) {
                const distance = this.distanceInMBetweenEarthCoordinates(coords, this.waypoints[this.waypoints.length-1]);
                this.distance =  this.distance + distance;
            }
            this.waypoints.push(waypoint);
            console.log('recording', this.waypoints);
            console.log('distance', this.distance, ' m');
        }
        this.callbacks.forEach(c => c(waypoint, this.waypoints));
    }

    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    distanceInMBetweenEarthCoordinates(waypoint1:Waypoint, waypoint2:Waypoint):number {
        let lat1 = waypoint1.latitude;
        const lon1 = waypoint1.longitude;
        let lat2 = waypoint2.latitude;
        const lon2 = waypoint2.longitude;

        const earthRadiusM = 6371 * 1000;

        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);

        lat1 = this.degreesToRadians(lat1);
        lat2 = this.degreesToRadians(lat2);

        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((earthRadiusM * c).toFixed(2));
    }

    startTracking () {
        this.waypoints = [];
        this.isTracking = true;
        this.updatePosition(this.getCurrentPosition());
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
        return {latitude: this.lat, longitude: this.lng, accuracy: this.accuracy};
    }

    get distanceInKm () {
        console.log('dist')
        return (this.distance / 1000).toFixed(2);
    }

}
