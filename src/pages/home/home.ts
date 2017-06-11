import {Component, ViewChild} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';

import {LocationTracker, Waypoint} from '../../providers/location-tracker';
import * as Leaflet from 'leaflet';
import {Map} from 'leaflet';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {

    @ViewChild('map') map;

    public isTracking: boolean = false;
    public waypoints: Array<Waypoint> = [];
    public leaflet: Map;

    constructor (public navCtrl: NavController,
                 private platform: Platform,
                 private statusBar: StatusBar,
                 private locationTracker: LocationTracker) {
        platform.ready().then(() => {
            this.init();
            this.statusBar.overlaysWebView(true);
            this.statusBar.backgroundColorByHexString('#00487B');
        });
    }

    init () {
        this.loadMap();
        this.locationTracker.watchPosition();
        this.locationTracker.onPositionUpdate((lat, lng, waypoints) => {
            this.updatePosition(lat, lng);
            this.waypoints = waypoints;
        });
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
        this.locationTracker.startTracking();
    }

    stopTracking () {
        this.isTracking = false;
        this.waypoints = this.locationTracker.stopTracking();
    }

    ionViewWillLeave () {
        this.stopTracking();
    }

    updatePosition (lat: number, lng: number, zoom?: number) {
        this.map.setView([lat, lng], zoom);
    }

    loadMap () {
        this.map = Leaflet.map('map');

        Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(this.map);

        this.updatePosition(47.0272, 8.4436223, 17);
    }

    getTime (unixTime: number): string {
        const date = new Date(unixTime * 1000);
        const hours = date.getHours();
        const minutes = '0' + date.getMinutes();
        const seconds = '0' + date.getSeconds();

        return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
    }

}
