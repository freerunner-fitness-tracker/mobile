import {BrowserModule} from '@angular/platform-browser'
import {ErrorHandler, NgModule} from '@angular/core'
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular'

import {MyApp} from './app.component'
import {HomePage} from '../pages/home/home'
import {ListPage} from '../pages/list/list'

import {StatusBar} from '@ionic-native/status-bar'
import {SplashScreen} from '@ionic-native/splash-screen'

import {Geolocation} from '@ionic-native/geolocation'
// import {BackgroundGeolocation} from '@ionic-native/background-geolocation'
import {LocationTracker} from '../providers/location-tracker'

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ListPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ListPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Geolocation,
        // BackgroundGeolocation,
        LocationTracker,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
