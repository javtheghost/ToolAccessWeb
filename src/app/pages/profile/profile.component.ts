import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Profile {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
<div class="p-6">
    <div class="max-w-md">
        <h1 class="text-2xl font-bold text-[var(--primary-color)] mb-6">Perfil</h1>

        <form class="space-y-4">
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">person</span>
                <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    required
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Nombres"
                    [(ngModel)]="profile.nombres"
                />
                <label for="nombres" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombres</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">person</span>
                <input
                    type="text"
                    id="apellidoPaterno"
                    name="apellidoPaterno"
                    required
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Apellido Paterno"
                    [(ngModel)]="profile.apellidoPaterno"
                />
                <label for="apellidoPaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Paterno</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">person</span>
                <input
                    type="text"
                    id="apellidoMaterno"
                    name="apellidoMaterno"
                    required
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Apellido Materno"
                    [(ngModel)]="profile.apellidoMaterno"
                />
                <label for="apellidoMaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Materno</label>
            </div>

            <div class="pt-4">
                <button
                    type="button"
                    (click)="actualizarPerfil()"
                    class="bg-[var(--primary-color)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#1e3a8a] transition-colors duration-200"
                >
                    Actualizar
                </button>
            </div>
        </form>
    </div>
</div>
    `,
    styles: []
})
export class ProfileComponent implements OnInit {
    profile: Profile = {
        nombres: 'Francisco Javier',
        apellidoPaterno: 'Mota',
        apellidoMaterno: 'Ontiveros'
    };

    constructor() {}

    ngOnInit() {
        // Cargar datos del perfil actual
    }

    actualizarPerfil() {
        // Lógica para actualizar el perfil
        console.log('Perfil actualizado:', this.profile);
    }
}
