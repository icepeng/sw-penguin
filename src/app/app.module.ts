import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileDialogComponent } from './containers/file-dialog.component';
import { MonsterListComponent } from './containers/monster-list.component';
import { RuneCalcComponent } from './containers/rune-calc.component';
import { RuneListComponent } from './containers/rune-list.component';
import { MonsterEffects } from './effects/monster.effects';
import { MaterialModule } from './material/material.module';
import { metaReducers, reducers } from './reducers';
import { ImportService } from './services/import.service';

@NgModule({
  declarations: [
    AppComponent,
    FileDialogComponent,
    MonsterListComponent,
    RuneListComponent,
    RuneCalcComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([MonsterEffects]),
  ],
  providers: [ImportService],
  entryComponents: [FileDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
