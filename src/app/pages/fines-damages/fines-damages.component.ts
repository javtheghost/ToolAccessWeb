import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DamageTypesCrudComponent } from './damage-types-crud.component';
import { HistoryDamagesCrudComponent } from './history-damages-crud.component';
import { FinesConfigCrudComponent } from './fines-config-crud.component';
import { RecentFinesCrudComponent } from './recent-fines-crud.component';

@Component({
  selector: 'app-fines-damages',
  standalone: true,
  imports: [CommonModule, ButtonModule, DamageTypesCrudComponent, HistoryDamagesCrudComponent, FinesConfigCrudComponent, RecentFinesCrudComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
            <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-[var(--primary-color)]">Configuración de Multas y Daños</h1>
      </div>

      <section class="mb-8">
        <app-damage-types-crud></app-damage-types-crud>
      </section>

      <section class="mb-8">
        <app-history-damages-crud></app-history-damages-crud>
      </section>

      <section class="mb-8">
        <app-fines-config-crud></app-fines-config-crud>
      </section>

      <section>
        <app-recent-fines-crud></app-recent-fines-crud>
      </section>
    </div>
  `
})
export class FinesDamagesComponent {
  constructor() {}
}
