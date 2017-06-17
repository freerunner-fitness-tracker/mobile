import {Component, Input} from '@angular/core';
import {Platform} from 'ionic-angular';
import {getTime} from '../../utils';
import {ActivityModel} from './activity-model';
import * as moment from 'moment';

@Component({
    selector: 'activity-card',
    templateUrl: 'activity-card.html'
})
export class ActivityCard {
    @Input() activity: ActivityModel;
    @Input() renderMap: boolean = true;

    constructor (private platform: Platform) {
    }

    public getTime (value) {
        return getTime(value);
    }

    public getDate (value) {
        return moment(value, 'X').calendar();
    }
}