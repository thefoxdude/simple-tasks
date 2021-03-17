import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from "src/environments/environment";
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from './services/AuthenticationService.service';
import { DatabaseService } from './services/DatabaseService.service';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
   declarations: [
      AppComponent
   ],
   imports: [
      BrowserModule,
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFirestoreModule,
      FormsModule,
      AngularFireAuthModule,
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
   ],
   providers: [
      AuthenticationService,
      DatabaseService
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
