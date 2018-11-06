import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonsterListComponent } from './containers/monster-list.component';
import { RuneListComponent } from './containers/rune-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/runes', pathMatch: 'full' },
  {
    path: 'runes',
    component: RuneListComponent,
  },
  { path: 'monsters', component: MonsterListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
