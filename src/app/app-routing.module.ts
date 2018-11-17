import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonsterListComponent } from './containers/monster-list.component';
import { RuneCalcComponent } from './containers/rune-calc.component';
import { RuneListComponent } from './containers/rune-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/runes', pathMatch: 'full' },
  {
    path: 'runes',
    component: RuneListComponent,
  },
  { path: 'monsters', component: MonsterListComponent },
  { path: 'calc', component: RuneCalcComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
