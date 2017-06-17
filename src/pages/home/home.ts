import {Component, ViewChild} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';

import {LocationTracker, Waypoint} from '../../providers/location-tracker';
import * as Leaflet from 'leaflet';
import {ActivitiesStore} from '../../providers/activities-store';
import {getTime, unixTime} from '../../utils';
import {ActivityModel} from '../../components/activity/activity-model';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {

    @ViewChild('map') map;

    public isTracking: boolean = false;
    public startedAt: number;
    public waypoints: Array<Waypoint> = [];
    public showWaypointLog: boolean = true;
    public leaflet;
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

    public toggleTracking () {
        if (this.isTracking) {
            this.stopTracking();
        } else {
            this.startTracking();
        }
    }

    protected startTracking () {
        this.isTracking = true;
        this.startedAt = unixTime();
        this.waypoints = [];
        this.addPath();
        this.locationTracker.startTracking();
    }

    protected async stopTracking () {
        this.isTracking = false;
        this.waypoints = this.locationTracker.stopTracking();
        const activity: ActivityModel = new ActivityModel(
            this.startedAt,
            unixTime(),
            this.locationTracker.distance,
            this.waypoints
        );
        const recorded = await this.activitiesStore.addActivity(activity);
    }

    protected ionViewWillLeave () {
        // this.stopTracking();
    }

    protected updatePosition (waypoint: Waypoint) {
        this.leaflet.setView([waypoint.latitude, waypoint.longitude]);

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
        }, {radius: 4, weight: 2, fill: true, fillOpacity: 1, fillColor: '#ffffff'}).addTo(this.leaflet);
        this.positionMarkerRadius = Leaflet.circleMarker({
            lat: waypoint.latitude, lng: waypoint.longitude
        }, {radius, weight: 2, opacity: .6}).addTo(this.leaflet);
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
        ], {smoothFactor: 5}).addTo(this.leaflet);
    }

    protected drawPath (waypoint: Waypoint) {
        if (!this.isTracking) return;

        this.path.addLatLng({lat: waypoint.latitude, lng: waypoint.longitude});
    }

    protected loadMap () {
        this.leaflet = Leaflet.map(this.map.nativeElement, {
            attributionControl: false,
            zoomControl: false
        });
        this.leaflet.setView([47.0272, 8.4436223], 17);

        Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18}).addTo(this.leaflet);
    }

    public getTime (value) {
        return getTime(value);
    }

}
