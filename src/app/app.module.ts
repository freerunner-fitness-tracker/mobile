import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';

import {Geolocation} from '@ionic-native/geolocation';
// import {BackgroundGeolocation} from '@ionic-native/background-geolocation'
import {BackgroundMode} from '@ionic-native/background-mode';
import {LocationTracker} from '../providers/location-tracker';
import {ActivitiesStore} from '../providers/activities-store';
import {ActivityPage} from '../pages/activity/activity';
import {ActivityCard} from '../components/activity/activity-card';
import {ActivityMap} from '../components/activity/activity-map';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ActivityPage,
        ActivityCard,
        ActivityMap,
        ListPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ActivityPage,
        ListPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Geolocation,
        // BackgroundGeolocation,
        BackgroundMode,
        LocationTracker,
        SQLite,
        File,
        ActivitiesStore,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
