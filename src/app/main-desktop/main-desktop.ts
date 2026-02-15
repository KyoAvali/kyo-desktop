import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DockModule } from 'primeng/dock';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-desktop',
  imports: [ButtonModule, DockModule],
  templateUrl: './main-desktop.html',
  styleUrl: './main-desktop.scss',
})
export class MainDesktop {

  dockItems: MenuItem[] | undefined;

  ngOnInit() {
    this.dockItems = [
      {
        label: 'Finder',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg'
      },
      {
        label: 'Terminal',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/terminal.svg'
      },
      {
        label: 'App Store',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/appstore.svg'
      },
      {
        label: 'Safari',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/safari.svg'
      },
      {
        label: 'Photos',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/photos.svg'
      },
      {
        label: 'GitHub',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/github.svg'
      },
      {
        label: 'Trash',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/trash.png'
      }
    ];
  }
}
