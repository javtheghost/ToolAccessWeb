import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinesConfigComponent } from './fines-config/fines-config.component';
import { DamageTypesRegistryComponent } from './damage-types-registry/damage-types-registry.component';
import { DamageHistoryComponent } from './damage-history/damage-history.component';
import { RecentFinesComponent } from './recent-fines/recent-fines.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-fines-damages',
  standalone: true,
  templateUrl: './fines-damages.component.html',
  styleUrls: ['./fines-damages.component.scss'],
  imports: [
    CommonModule,
    FinesConfigComponent,
    DamageTypesRegistryComponent,
    DamageHistoryComponent,
    RecentFinesComponent,
    ButtonModule
  ]
})
export class FinesDamagesComponent {
abrirModalMulta() {
throw new Error('Method not implemented.');
}
abrirModalTipo() {
throw new Error('Method not implemented.');
}
}
