import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {ActivitiesStore} from '../../providers/activities-store';
import {ActivityPage} from '../activity/activity';
import {UUID} from 'angular2-uuid';
import {ActivityModel} from '../../components/activity/activity-model';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {
    public items: Array<ActivityModel>;
    public itemsPerPage: number = 3;
    public offset: number = 0;
    public isFetching: boolean;

    constructor (public navCtrl: NavController,
                 public navParams: NavParams,
                 public activitiesStore: ActivitiesStore,
                 public platform: Platform) {
    }

    public ngOnInit () {
        this.isFetching = true;
        this.offset = 0;
        this.fetchActivites();
    }

    public async fetchActivites () {
        let items = [];
        try {
            items = await this.activitiesStore.getActivities(this.itemsPerPage, 0);
        } catch (e) {
            console.log('Failed to fetch activities', JSON.stringify(e));
        } finally {
            this.isFetching = false;
        }
        this.items = items;
    }

    public async doInfinite (infiniteScroll) {
        this.offset += 3;
        const items = await this.activitiesStore.getActivities(this.itemsPerPage, this.offset);
        this.items = this.items.concat(items);

        infiniteScroll.complete();
    }

    public goToActivity (id: UUID) {
        this.navCtrl.push(ActivityPage, {id});
    }
}
