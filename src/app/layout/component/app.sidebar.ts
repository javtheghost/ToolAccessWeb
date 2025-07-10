import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AppMenu } from './app.menu';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, CommonModule],
    template: ` 
    <div class="layout-sidebar" (scroll)="onScroll($event)" #sidebarElement>
        <app-menu></app-menu>
        
        <!-- Indicador de scroll hacia abajo - Círculo flotante -->
        <div class="scroll-down-indicator" *ngIf="showScrollDown" (click)="scrollToBottom()">
            <i class="pi pi-chevron-down"></i>
        </div>
    </div>`
})
export class AppSidebar implements OnInit, AfterViewInit {
    @ViewChild('sidebarElement', { static: false }) sidebarElement!: ElementRef;
    
    showScrollDown = false;
    
    constructor(public el: ElementRef) {}
    
    ngOnInit() {
        // Inicializar estado
    }
    
    ngAfterViewInit() {
        // Detectar si hay scroll disponible después de que la vista se inicialice
        setTimeout(() => {
            this.checkScrollAvailability();
        }, 100);
    }
    
    onScroll(event: any) {
        const element = event.target;
        // Mostrar flecha hacia abajo si no estamos en el final del scroll
        this.showScrollDown = element.scrollTop < (element.scrollHeight - element.clientHeight - 10);
    }
    
    scrollToBottom() {
        if (this.sidebarElement) {
            this.sidebarElement.nativeElement.scrollTo({
                top: this.sidebarElement.nativeElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    
    private checkScrollAvailability() {
        const sidebarElement = this.el.nativeElement.querySelector('.layout-sidebar');
        if (sidebarElement) {
            this.showScrollDown = sidebarElement.scrollHeight > sidebarElement.clientHeight;
        }
    }
}
