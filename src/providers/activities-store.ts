import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {Waypoint} from './location-tracker';
import {UUID} from 'angular2-uuid';
import {Platform} from 'ionic-angular';

export interface Activity {
    start: number;
    end: number;
    distance: number;
    waypoints: Array<Waypoint>;
}

@Injectable()
export class ActivitiesStore {

    protected database: SQLiteObject;

    constructor (private sqlite: SQLite,
                 private platform: Platform) {
        platform.ready().then(() => {
            this.openDB();
        });
    }

    public async openDB () {
        try {
            this.database = await this.sqlite.create({
                name: 'data.db',
                location: 'default'
            });
            return await this.database.executeSql('CREATE TABLE IF NOT EXISTS activities(id VARCHAR PRIMARY KEY, start INT NOT NULL, end INT NOT NULL, distance INT NOT NULL, waypoints TEXT NOT NULL);', {});
        } catch (e) {
            console.log(e);
            return;
        }
    }

    public async addActivity (activity?: Activity) {
        const uuid = UUID.UUID();
        await this.database.executeSql('INSERT INTO activities (id, start, end, distance, waypoints) VALUES (?, ?, ?, ?, ?)', [
            uuid,
            activity.start,
            activity.end,
            activity.distance,
            JSON.stringify(activity.waypoints)
        ]);

        return this.getActivities();
    }

    public async getActivities (): Promise<Array<Activity>> {
        let data;
        try {
            data = await this.database.executeSql('SELECT * FROM activities ORDER BY end DESC', []);
        } catch (e) {
            console.log(e);
            return [];
        }

        const activities = [];
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                const item = data.rows.item(i);
                activities.push({
                    ...item,
                    waypoints: JSON.parse(item.waypoints)
                });
            }
        }
        return activities;
    }

}
