import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../../store/auth/auth.store';
import { LucideArrowUpRight, LucideCakeSlice, LucideLogOut, LucideMenu, LucideUserRound, LucideX } from '@lucide/angular';
import { ConfiguracionStore } from '../../../store/configuracion/configuracion.store';
import { CloudinaryImagePipe } from '../../pipes/cloudinary-image.pipe';

@Component({ selector:'app-header', imports:[RouterLink,RouterLinkActive,LucideArrowUpRight,LucideCakeSlice,LucideLogOut,LucideMenu,LucideUserRound,LucideX,CloudinaryImagePipe], templateUrl:'./header.html', styleUrl:'./header.css' })
export class Header {
  readonly auth=inject(AuthStore);
  readonly config=inject(ConfiguracionStore);
  readonly menuAbierto=signal(false);
  private router=inject(Router);
  cerrarMenu():void { this.menuAbierto.set(false); }
  logout():void { this.cerrarMenu(); this.auth.logout(); }
}
