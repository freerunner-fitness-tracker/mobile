import {Injectable, NgZone} from '@angular/core'
import 'rxjs/add/operator/map'
// import {BackgroundGeolocation} from '@ionic-native/background-geolocation'
import {Geolocation, Geoposition} from '@ionic-native/geolocation'
import {LatLng} from '@ionic-native/google-maps'

type Callback = (lat: number, lng: number, waypoints?: Array<Waypoint>) => any

export interface Waypoint extends Coordinates {
    timestamp: number
}

@Injectable()
export class LocationTracker {

    public watch: any;
    public lat: number = 0;
    public lng: number = 0;
    public callbacks: Array<Callback> = []
    public record: boolean = false
    public hasSignal: boolean = false
    public waypoints: Array<Waypoint> = []

    constructor (public zone: NgZone,
                 private geolocation: Geolocation,
    //             private backgroundGeolocation: BackgroundGeolocation
    ) {
    }

    startTracking () {
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
            frequency: 3000,
            enableHighAccuracy: true
        };

        this.watch = this.geolocation.watchPosition(options)
            .subscribe((position: Geoposition) => {
                console.log(position);
                this.zone.run(() => this.updatePosition(position.coords));
            });
    }

    updatePosition (coords) {

        if(coords === undefined) {
            return this.hasSignal = false
        }

        this.hasSignal = true

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
            timestamp: Math.ceil(+ Date.now() / 1000)
        }

        if (this.record) {
            this.waypoints.push(waypoint)

            console.log('recording', this.waypoints)
        }

        this.callbacks.forEach(c => c(this.lat, this.lng, this.waypoints))
    }

    startRecording () {
        this.waypoints = [];
        this.record = true
    }

    stopRecording () {
        this.record = false
        return this.waypoints
    }

    onPositionUpdate (callback: Callback) {
        this.callbacks.push(callback)
    }

    stopTracking () {
        console.log('stopTracking');
        // this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }

    getCurrentPosition (): LatLng {
        return new LatLng(this.lat, this.lng)
    }

}
