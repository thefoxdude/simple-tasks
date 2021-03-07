import { NgModule, Injectable } from '@angular/core';
import * as Hammer from 'hammerjs';
import { BrowserModule, HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from "src/environments/environment";
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from './services/AuthenticationService.service';

@Injectable() 
export class MyHammerConfig extends HammerGestureConfig { 
  overrides = <any> { 
    swipe: { direction: Hammer.DIRECTION_RIGHT }, 
  }; 
} 

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
      HammerModule
   ],
   providers: [
      AuthenticationService,
      {
         provide: HAMMER_GESTURE_CONFIG,
         useClass: MyHammerConfig
      }
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
