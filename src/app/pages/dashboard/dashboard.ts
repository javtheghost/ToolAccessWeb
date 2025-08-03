import { Component } from '@angular/core';
import { StatsCardBlueComponent } from './components/stats-card-blue.component';
import { StatsCardOrangeComponent } from './components/stats-card-orange.component';
import { StatsCardGreenComponent } from './components/stats-card-green.component';
import { StatsCardRedComponent } from './components/stats-card-red.component';
import { LineChartComponent } from './components/line-chart.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
      StatsCardBlueComponent,
      StatsCardOrangeComponent,
      StatsCardGreenComponent,
      StatsCardRedComponent,
      LineChartComponent
    ],
    template: `
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
          <app-stats-card-blue />
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
          <app-stats-card-orange />
          prueba
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
          <app-stats-card-green />
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
          <app-stats-card-red />
        </div>
        <div class="col-span-12 mt-4">
          <app-line-chart />
        </div>
      </div>
    `
})
export class Dashboard {}

