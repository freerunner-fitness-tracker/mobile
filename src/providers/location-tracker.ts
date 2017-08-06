import {Injectable, NgZone} from '@angular/core';
import 'rxjs/add/operator/map';
// import {BackgroundGeolocation} from '@ionic-native/background-geolocation'
import {Geolocation, Geoposition} from '@ionic-native/geolocation';
import {Observable} from 'rxjs/Observable';
import {BackgroundMode} from '@ionic-native/background-mode';
import {Subscription} from 'rxjs/Subscription';
import {Platform} from 'ionic-angular';

type Callback = (waypoint: Waypoint, waypoints?: Array<Waypoint>) => any;
type WaypointMetaType = 'Flag';

export interface WaypointMetaData {
    type: WaypointMetaType;
}

export interface Waypoint extends Coordinates {
    timestamp: number;
    meta?: WaypointMetaData;
}

@Injectable()
export class LocationTracker {

    public watch: any;
    public lat: number = 0;
    public lng: number = 0;
    public accuracy: number = 0;
    public distance: number = 0;
    public backgroundModeSubscription: Subscription;

    public callbacks: Array<Callback> = [];
    public isTracking: boolean = false;
    public hasSignal: boolean = false;
    public waypoints: Array<Waypoint> = [];

    constructor (public zone: NgZone,
                 private geolocation: Geolocation,
                 private backgroundMode: BackgroundMode
                 //             private backgroundGeolocation: BackgroundGeolocation
    ) {
        this.backgroundMode.setDefaults({
            title: 'Activity in progress',
            text: 'FreeRunner is tracking your activity',
            color: '00487B',
            icon: 'icon'
        });
    }

    public watchPosition () {
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

    public updatePosition (coords) {
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
                this.distance += this.distanceInMBetweenEarthCoordinates(
                    coords,
                    this.waypoints[this.waypoints.length - 1]
                );
            }
            this.waypoints.push(waypoint);
        }
        this.callbacks.forEach(c => c(waypoint, this.waypoints));
    }

    public degreesToRadians (degrees) {
        return degrees * Math.PI / 180;
    }

    public distanceInMBetweenEarthCoordinates (waypoint1: Waypoint, waypoint2: Waypoint): number {
        let lat1 = waypoint1.latitude;
        const lon1 = waypoint1.longitude;
        let lat2 = waypoint2.latitude;
        const lon2 = waypoint2.longitude;

        const earthRadiusM = 6371 * 1000;

        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);

        lat1 = this.degreesToRadians(lat1);
        lat2 = this.degreesToRadians(lat2);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((earthRadiusM * c).toFixed(2));
    }

    public startTracking () {
        this.waypoints = [];
        this.distance = 0;
        this.isTracking = true;
        this.updatePosition(this.getCurrentPosition());

        this.backgroundMode.enable();
        this.backgroundModeSubscription = this.backgroundMode.on('activate').subscribe(() => {
            this.backgroundMode.disableWebViewOptimizations();
        });
    }

    public stopTracking () {
        this.isTracking = false;
        this.backgroundModeSubscription.unsubscribe();
        return this.waypoints;
    }

    public onPositionUpdate (callback: Callback) {
        this.callbacks.push(callback);
    }

    public unwatchPosition () {
        console.log('unwatchPosition');
        // this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }

    public getCurrentPosition () {
        return {latitude: this.lat, longitude: this.lng, accuracy: this.accuracy};
    }

    get distanceInKm () {
        return (this.distance / 1000).toFixed(2);
    }

}
