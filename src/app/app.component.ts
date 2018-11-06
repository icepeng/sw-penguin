import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileDialogComponent } from './containers/file-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {}

  openDialog() {
    const dialogRef = this.dialog.open(FileDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
    });
  }
}
