import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideBriefcaseBusiness, LucideImages, LucideMenu, LucidePackage, LucideSettings, LucideShoppingBag, LucideTags, LucideUsers, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideBriefcaseBusiness, LucideImages, LucideMenu, LucidePackage, LucideSettings, LucideShoppingBag, LucideTags, LucideUsers, LucideX],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  readonly menuMovil = signal(false);
  cerrarMenu(): void { this.menuMovil.set(false); }
}
