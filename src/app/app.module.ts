import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MonsterListComponent } from './containers/monster-list.component';
import { RuneListComponent } from './containers/rune-list.component';
import { FileDialogComponent } from './file-dialog/file-dialog.component';
import { MaterialModule } from './material/material.module';
import { reducers } from './reducers';
import { ImportService } from './services/import.service';

@NgModule({
  declarations: [
    AppComponent,
    FileDialogComponent,
    MonsterListComponent,
    RuneListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers),
  ],
  providers: [ImportService],
  entryComponents: [FileDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
