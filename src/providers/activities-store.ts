import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {Waypoint} from './location-tracker';
import {UUID} from 'angular2-uuid';

export interface Activity {
    start: number;
    end: number;
    waypoints: Array<Waypoint>;
}

@Injectable()
export class ActivitiesStore {

    protected database: SQLiteObject;

    constructor (private sqlite: SQLite) {
    }

    public async openDB () {
        try {
            this.database = await this.sqlite.create({
                name: 'data.db',
                location: 'default'
            });
            this.database.executeSql('CREATE TABLE IF NOT EXISTS activities(id VARCHAR PRIMARY KEY, start INT NOT NULL, end INT NOT NULL);', {});
        } catch (e) {
            console.log(e);
            return;
        }

    }

    public async addActivity (activity?: Activity) {
        const uuid = UUID.UUID();
        await this.database.executeSql('INSERT INTO activities (id, start, end) VALUES (?, ?, ?)', [
            uuid,
            activity.start,
            activity.end
        ]);
        return this.getActivities();
    }

    public async getActivities (): Promise<Array<Activity>> {
        const data = await this.database.executeSql('SELECT * FROM activities', []);
        const activities = [];
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                activities.push(data.rows.item(i));
            }
        }
        return activities;
    }

}
