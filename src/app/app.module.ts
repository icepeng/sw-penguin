import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MonsterListComponent } from './containers/monster-list.component';
import { RuneListComponent } from './containers/rune-list.component';
import { FileDialogComponent } from './containers/file-dialog.component';
import { MaterialModule } from './material/material.module';
import { reducers, metaReducers } from './reducers';
import { ImportService } from './services/import.service';
import { RuneCalcComponent } from './containers/rune-calc.component';

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
  ],
  providers: [ImportService],
  entryComponents: [FileDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
