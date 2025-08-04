import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OAuthService } from '../service/oauth.service';
import { User } from '../../interfaces/oauth.interfaces';

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
        <h1 class="text-2xl font-bold text-[var(--primary-color)] mb-6">Perfil de usuario</h1>

        <form class="space-y-4">
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">person</span>
                <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    required
                    disabled
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-gray-100 px-10 text-sm text-gray-500 cursor-not-allowed"
                    placeholder=" "
                    aria-label="Nombres"
                    [(ngModel)]="profile.nombres"
                />
                <label for="nombres" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombres</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">person</span>
                <input
                    type="text"
                    id="apellidoPaterno"
                    name="apellidoPaterno"
                    required
                    disabled
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-gray-100 px-10 text-sm text-gray-500 cursor-not-allowed"
                    placeholder=" "
                    aria-label="Apellido Paterno"
                    [(ngModel)]="profile.apellidoPaterno"
                />
                <label for="apellidoPaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Paterno</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">person</span>
                <input
                    type="text"
                    id="apellidoMaterno"
                    name="apellidoMaterno"
                    required
                    disabled
                    class="peer block w-full h-12 rounded-lg border border-gray-300 bg-gray-100 px-10 text-sm text-gray-500 cursor-not-allowed"
                    placeholder=" "
                    aria-label="Apellido Materno"
                    [(ngModel)]="profile.apellidoMaterno"
                />
                <label for="apellidoMaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Materno</label>
            </div>


        </form>
    </div>
</div>
    `,
    styles: []
})
export class ProfileComponent implements OnInit {
    profile: Profile = {
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: ''
    };

    user: User | null = null;

    constructor(private oauthService: OAuthService) {}

    ngOnInit() {
        // Suscribirse al usuario autenticado
        this.oauthService.user$.subscribe((user: User | null) => {
            this.user = user;
            if (user) {
                this.profile = {
                    nombres: user.nombre || '',
                    apellidoPaterno: user.apellido_paterno || '',
                    apellidoMaterno: user.apellido_materno || ''
                };
            }
        });
    }

}
