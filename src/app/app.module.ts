import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { FileDialogComponent } from './file-dialog/file-dialog.component';
import { MaterialModule } from './material/material.module';
import { RuneService } from './rune.service';

@NgModule({
  declarations: [AppComponent, FileDialogComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule],
  providers: [RuneService],
  entryComponents: [FileDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
