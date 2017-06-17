import {Component, Input, ViewChild} from '@angular/core';
import * as Leaflet from 'leaflet';
import {Waypoint} from '../../providers/location-tracker';

@Component({
    selector: 'activity-map',
    templateUrl: 'activity-map.html'
})
export class ActivityMap {
    @Input() waypoints: Array<Waypoint> = [];
    @Input() renderMap: boolean = true;
    @ViewChild('map') map;

    private leaflet;

    ngAfterViewInit () {
        if (this.renderMap) {
            this.initMap();
        }
    }

    public initMap () {
        this.leaflet = Leaflet.map(this.map.nativeElement, {
            attributionControl: false,
            zoomControl: false
        });

        Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(this.leaflet);

        if (this.waypoints.length > 0) {
            this.drawPath();
        }
    }

    protected drawPath () {
        const coords = this.waypoints.map((waypoint: Waypoint) => {
            return {lat: waypoint.latitude, lng: waypoint.longitude};
        });
        const path = new Leaflet.Polyline(coords, {smoothFactor: 5}).addTo(this.leaflet);
        this.leaflet.fitBounds(path.getBounds());
    }
}