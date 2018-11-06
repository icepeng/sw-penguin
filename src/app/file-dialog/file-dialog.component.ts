import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ImportService } from '../services/import.service';
import { Store } from '@ngrx/store';
import { Import } from '../actions/import.actions';

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.component.html',
  styleUrls: ['./file-dialog.component.css'],
})
export class FileDialogComponent implements OnInit {
  listener: any;

  constructor(
    public dialogRef: MatDialogRef<FileDialogComponent>,
    public runeService: ImportService,
    private store: Store<any>,
  ) {}

  ngOnInit() {}

  fileChange(event): void {
    this.listener = event.target;
  }

  fileRead(): void {
    const file: File = this.listener.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = () => {
      const imported = this.runeService.import(
        JSON.parse(myReader.result as string),
      );
      this.store.dispatch(new Import(imported));
      this.dialogRef.close('success');
    };

    myReader.readAsText(file);
  }
}
