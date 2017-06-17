import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {ActivitiesStore} from '../../providers/activities-store';
import {getDate, getTime} from '../../utils';
import {ActivityPage} from '../activity/activity';
import {UUID} from 'angular2-uuid';
import {ActivityModel} from '../../components/activity/activity-model';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {
    items: Array<ActivityModel>;

    constructor (public navCtrl: NavController,
                 public navParams: NavParams,
                 public activitiesStore: ActivitiesStore,
                 public platform: Platform) {
        platform.ready().then(() => {
            this.fetchActivites();
        });
    }

    async fetchActivites () {
        let items = [];
        try {
            items = await this.activitiesStore.getActivities();
        } catch (e) {
            console.log('Failed to fetch activities', JSON.stringify(e));
        }
        this.items = items;
    }

    goToActivity (id: UUID) {
        this.navCtrl.push(ActivityPage, {id});
    }
}
