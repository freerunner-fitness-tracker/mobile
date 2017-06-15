import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {ActivitiesStore, Activity} from '../../providers/activities-store';
import {getDate, getTime} from '../../utils';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {
    items: Array<Activity>;

    constructor (public navCtrl: NavController,
                 public navParams: NavParams,
                 public activitiesStore: ActivitiesStore,
                 public platform: Platform) {
        platform.ready().then(() => {
            this.fetchActivites();
        });
    }

    async fetchActivites () {
        const items = await this.activitiesStore.getActivities();
        this.items = items;
    }

    public getTime (value) {
        return getTime(value);
    }

    public getDate (value) {
        return getDate(value);
    }
}
