import {Component, ViewChild} from '@angular/core'
import {NavController, Platform} from 'ionic-angular'
import {StatusBar} from '@ionic-native/status-bar'

import {CameraPosition, GoogleMap, GoogleMaps, GoogleMapsEvent, LatLng} from '@ionic-native/google-maps'
import {LocationTracker, Waypoint} from '../../providers/location-tracker'

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {

    @ViewChild('map') map;

    public gmap: GoogleMap;
    public isTracking: boolean = false
    public waypoints: Array<Waypoint> = []

    constructor (public navCtrl: NavController,
                 private googleMaps: GoogleMaps,
                 private platform: Platform,
                 private statusBar: StatusBar,
                 private locationTracker: LocationTracker) {
        platform.ready().then(() => {
            this.init();
            this.statusBar.overlaysWebView(true);
            this.statusBar.backgroundColorByHexString('#00487B');
        })
    }

    init () {
        this.loadMap();
        this.locationTracker.startTracking();
        this.locationTracker.onPositionUpdate((lat, lng, waypoints) => {
            this.updatePosition(lat, lng);
            this.waypoints = waypoints;
        })
    }

    toggleTracking () {
        if (this.isTracking) {
            this.stopTracking();
        } else {
            this.startTracking();
        }
    }

    startTracking () {
        this.isTracking = true;
        this.waypoints = [];
        this.locationTracker.startRecording()
    }

    stopTracking () {
        this.isTracking = false;
        this.waypoints = this.locationTracker.stopRecording()
    }

    ionViewWillLeave () {
        this.stopTracking();
    }

    updatePosition (lat: number, lng: number) {
        console.log('Updating position to', lat, lng);

        const target: LatLng = new LatLng(lat, lng);

        const position: CameraPosition = {
            target,
            zoom: 16
        };

        // move the map's camera to position
        this.gmap.moveCamera(position);
    }

    loadMap () {
        // create a new map by passing HTMLElement
        let element: HTMLElement = document.getElementById('map');

        this.gmap = this.googleMaps.create(element);

        // listen to MAP_READY event
        // You must wait for this event to fire before adding something to the map or modifying it in anyway
        this.gmap.one(GoogleMapsEvent.MAP_READY).then(() => {
            this.gmap.setMyLocationEnabled(true);
        });

        this.updatePosition(47.0272, 8.4436223)
    }

    getTime(unixTime: number): string {
        const date = new Date(unixTime * 1000)
        const hours = date.getHours();
        const minutes = '0' + date.getMinutes();
        const seconds = '0' + date.getSeconds();

        return `${hours}:${minutes.substr(- 2)}:${seconds.substr(- 2)}`;
    }

}
