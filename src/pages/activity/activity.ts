import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {ActivitiesStore} from '../../providers/activities-store';
import {UUID} from 'angular2-uuid';
import {ActivityModel} from '../../components/activity/activity-model';

@Component({
    selector: 'page-activity',
    templateUrl: 'activity.html'
})
export class ActivityPage {
    activity: ActivityModel;

    constructor (public navCtrl: NavController,
                 public navParams: NavParams,
                 public activitiesStore: ActivitiesStore,
                 public platform: Platform) {
        platform.ready().then(() => {
            this.fetchActivity(this.navParams.get('id'));
        });
    }

   async fetchActivity (id: UUID) {
       try {
           this.activity = await this.activitiesStore.getActivity(id);
       } catch (e) {
           console.log(`Failed to fetch activity ${id}`, JSON.stringify(e));
       }
   }
}
