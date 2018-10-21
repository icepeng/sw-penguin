import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RuneService } from '../rune.service';

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.component.html',
  styleUrls: ['./file-dialog.component.css'],
})
export class FileDialogComponent implements OnInit {
  listener: any;

  constructor(
    public dialogRef: MatDialogRef<FileDialogComponent>,
    public runeService: RuneService,
  ) {}

  ngOnInit() {}

  fileChange(event): void {
    this.listener = event.target;
  }

  fileRead(): void {
    const file: File = this.listener.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = () => {
      this.runeService.import(JSON.parse(myReader.result as string));
      this.dialogRef.close('success');
    };

    myReader.readAsText(file);
  }
}
