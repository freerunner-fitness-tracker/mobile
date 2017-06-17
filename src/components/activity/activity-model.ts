import {UUID} from 'angular2-uuid';
import {Waypoint} from '../../providers/location-tracker';
import {padLeft} from '../../utils';
export class ActivityModel {
    constructor (public start: number,
                 public end: number,
                 public distance: number,
                 public waypoints: Array<Waypoint>,
                 public id?: UUID) {
    }

    static fromObject (data) {
        return new ActivityModel(data.start, data.end, data.distance, data.waypoints, data.id);
    }

    get distanceInKm (): string {
        return (this.distance / 1000).toFixed(2);
    }

    get durationInSeconds (): number {
        return this.end - this.start;
    }

    get durationAsTime (): string {
        const minutes = Math.floor(this.durationInSeconds / 60);
        const seconds = this.durationInSeconds % 60;
        return `${padLeft(minutes, '0', 2)}:${padLeft(seconds, '0', 2)}`;
    }

    get calories (): string {
        return '-';
    }

    get avgPace (): string {
        return '-';
    }
}