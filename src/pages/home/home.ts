import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';

import {LocationTracker, Waypoint} from '../../providers/location-tracker';
import * as Leaflet from 'leaflet';
import {ActivitiesStore, Activity} from '../../providers/activities-store';
import {getTime, unixTime} from '../../utils';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {

    public isTracking: boolean = false;
    public startedAt: number;
    public waypoints: Array<Waypoint> = [];
    public showWaypointLog: boolean = true
    public map;
    public positionMarker;
    public positionMarkerRadius;
    public path;

    constructor (public navCtrl: NavController,
                 private platform: Platform,
                 private statusBar: StatusBar,
                 private activitiesStore: ActivitiesStore,
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
        this.locationTracker.onPositionUpdate((waypoint, waypoints) => {
            this.updatePosition(waypoint);
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
        this.startedAt = unixTime();
        this.waypoints = [];
        this.addPath();
        this.locationTracker.startTracking();
    }

    async stopTracking () {
        this.isTracking = false;
        this.waypoints = this.locationTracker.stopTracking();
        const activity: Activity = {
            start: this.startedAt,
            end: unixTime(),
            waypoints: this.waypoints
        };
        const recorded = await this.activitiesStore.addActivity(activity);
    }

    ionViewWillLeave () {
        this.stopTracking();
    }

    updatePosition (waypoint: Waypoint) {
        this.map.setView([waypoint.latitude, waypoint.longitude]);

        const radius = waypoint.accuracy / 2;

        if (!this.positionMarker) {
            this.addPositionMarker(waypoint, radius);
        } else {
            this.movePositionMarker(waypoint, radius);
        }
    }

    protected addPositionMarker (waypoint: Waypoint, radius: number) {
        this.positionMarker = Leaflet.circleMarker({
            lat: waypoint.latitude, lng: waypoint.longitude
        }, {radius: 1, weight: 3}).addTo(this.map);
        this.positionMarkerRadius = Leaflet.circleMarker({
            lat: waypoint.latitude, lng: waypoint.longitude
        }, {radius, weight: 1, opacity: .6}).addTo(this.map);
    }

    protected movePositionMarker (waypoint: Waypoint, radius: number) {
        this.positionMarker.setLatLng({
            lat: waypoint.latitude, lng: waypoint.longitude
        });
        this.positionMarkerRadius.setLatLng({
            lat: waypoint.latitude, lng: waypoint.longitude
        }).setRadius(radius);

        this.drawPath(waypoint);
    }

    protected addPath () {
        if (this.path) {
            this.path.remove();
            this.path = null;
        }

        const position = this.locationTracker.getCurrentPosition();
        this.path = new Leaflet.Polyline([
            {lat: position.latitude, lng: position.longitude}
        ], {smoothFactor: 5}).addTo(this.map);
    }

    protected drawPath (waypoint: Waypoint) {
        if (!this.isTracking) return;

        this.path.addLatLng({lat: waypoint.latitude, lng: waypoint.longitude});
    }

    loadMap () {
        this.map = Leaflet.map('map');
        this.map.setView([47.0272, 8.4436223], 17);

        Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(this.map);
    }

    getTime (value) {
        return getTime(value);
    }

}
