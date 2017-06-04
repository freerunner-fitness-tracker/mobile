import {Component, ViewChild} from '@angular/core'
import {NavController, Platform} from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar';

import {CameraPosition, GoogleMap, GoogleMaps, GoogleMapsEvent, LatLng} from '@ionic-native/google-maps'
import {Geolocation} from '@ionic-native/geolocation'

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {

    @ViewChild('map') map;

    public currentPosition: LatLng = new LatLng(0, 0)
    public positionUpdates
    public gmap: GoogleMap;

    constructor (public navCtrl: NavController,
                 private googleMaps: GoogleMaps,
                 private platform: Platform,
                 private statusBar: StatusBar,
                 private geolocation: Geolocation) {
        platform.ready().then(() => {
            this.init();
            this.statusBar.overlaysWebView(true);
            this.statusBar.backgroundColorByHexString('#00487B');
        })
    }

    init () {
        this.loadMap();

        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }

        this.geolocation.getCurrentPosition(geoOptions).then((data) => {
            console.log('Initial Position is', data)
            this.updatePosition(data.coords.latitude, data.coords.longitude)
        }).catch((error) => {
            console.log('Error getting location', error);
        });

        this.positionUpdates = this.geolocation.watchPosition(geoOptions).subscribe((data) => {
            if (data.coords) {
                this.updatePosition(data.coords.latitude, data.coords.longitude)
            }
        });
    }

    ionViewWillLeave () {
        this.positionUpdates.unsubscribe()
    }

    updatePosition (lat: number, lng: number) {
        console.log('Updating position to', lat, lng)

        const target: LatLng = new LatLng(lat, lng);
        this.currentPosition = target
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

}
