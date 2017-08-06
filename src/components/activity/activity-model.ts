import {UUID} from 'angular2-uuid';
import {Waypoint} from '../../providers/location-tracker';
import {padLeft} from '../../utils';
import {cachedProperty} from '../../decorators/cached-property';

export class ActivityModel {
    constructor (public start: number,
                 public end: number,
                 public distance: number,
                 public waypoints: Array<Waypoint>,
                 public id?: UUID) {
    }

    public static fromObject (data) {
        return new ActivityModel(data.start, data.end, data.distance, data.waypoints, data.id);
    }

    protected formatSeconds (input: number): string {
        const minutes = Math.floor(input / 60);
        const seconds = Math.floor(input % 60);
        return `${padLeft(minutes, '0', 2)}:${padLeft(seconds, '0', 2)}`;
    }

    @cachedProperty
    get distanceInKm (): string {
        return (this.distance / 1000).toFixed(2);
    }

    @cachedProperty
    get durationInSeconds (): number {
        return this.end - this.start;
    }

    @cachedProperty
    get durationAsTime (): string {
        return this.formatSeconds(this.durationInSeconds);
    }

    @cachedProperty
    get calories (): string {
        return '-';
    }

    @cachedProperty
    get avgPace (): string {
        const distance = parseFloat(this.distanceInKm);
        if (distance === 0) return '-';

        const pace = this.durationInSeconds / distance;
        return this.formatSeconds(pace);
    }
}