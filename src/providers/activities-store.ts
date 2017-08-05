import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {File} from '@ionic-native/file';
import {UUID} from 'angular2-uuid';
import {Platform} from 'ionic-angular';
import {ActivityModel} from '../components/activity/activity-model';

@Injectable()
export class ActivitiesStore {

    protected database: SQLiteObject;
    protected dirname = 'activities';

    public static readonly PATH_EXISTS_ERROR = 12;

    constructor (private sqlite: SQLite,
                 private file: File,
                 private platform: Platform) {
        platform.ready().then(() => {
            this.openDB();
            this.createStorageDir();
        });
    }

    public async openDB () {
        try {
            this.database = await this.sqlite.create({
                name: 'data.db',
                location: 'default'
            });
            return await this.database.executeSql('CREATE TABLE IF NOT EXISTS activities(id VARCHAR PRIMARY KEY, start INT NOT NULL, end INT NOT NULL, distance INT NOT NULL, duration INT NOT NULL, type VARCHAR NOT NULL);', {});
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    }

    public async addActivity (activity?: ActivityModel) {
        activity.id = UUID.UUID();

        await Promise.all([
            this.saveToDatabase(activity),
            this.saveToFile(activity)
        ]);

        return this.getActivities();
    }

    protected async saveToDatabase (activity: ActivityModel) {
        return this.database.executeSql(
            'INSERT INTO activities (id, start, end, distance, duration, type) VALUES (?, ?, ?, ?, ?, ?)', [
                activity.id,
                activity.start,
                activity.end,
                activity.distance,
                0,
                'Running'
            ]);
    }

    protected async saveToFile (activity: ActivityModel) {
        return this.file.writeFile(
            this.storagePath, this.filename(activity), JSON.stringify(activity.waypoints), {
                replace: true,
                append: false
            });
    }

    protected filename (activity: ActivityModel): string {
        return `${activity.id}.json`;
    }

    public async getActivities (count: number = 2, offset: number = 0): Promise<Array<ActivityModel>> {
        let data;
        try {
            data = await this.database.executeSql(`SELECT * FROM activities ORDER BY end DESC LIMIT ${count} OFFSET ${offset}`, []);
        } catch (e) {
            console.log(e);
            return [];
        }

        const activities = [];
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                const item = data.rows.item(i);
                activities.push(await this.hydrate(item));
            }
        }
        return activities;
    }

    public async getActivity (id: UUID): Promise<ActivityModel> {
        let data;
        try {
            data = await this.database.executeSql('SELECT * FROM activities WHERE id = ?', [id]);
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }

        return this.hydrate(data.rows.item(0));
    }

    protected async hydrate (activity: ActivityModel): Promise<ActivityModel> {
        const waypoints = await this.file.readAsText(this.storagePath, this.filename(activity));
        return new Promise<ActivityModel>((resolve) => {
            resolve(ActivityModel.fromObject({
                ...activity,
                waypoints: JSON.parse(waypoints)
            }));
        });
    }

    get storagePath () {
        return `${this.file.dataDirectory}${this.dirname}`;
    }

    protected async createStorageDir () {
        try {
            await this.file.createDir(this.file.dataDirectory, this.dirname, false);
        } catch (e) {
            // Don't report existing path error
            if (e.code === ActivitiesStore.PATH_EXISTS_ERROR) {
                return true;
            }
            console.log(JSON.stringify(e));
        }
    }

}
