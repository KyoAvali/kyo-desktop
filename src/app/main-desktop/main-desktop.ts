import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DockModule } from 'primeng/dock';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-desktop',
  imports: [ButtonModule, DockModule, DialogModule, TooltipModule],
  templateUrl: './main-desktop.html',
  styleUrl: './main-desktop.scss',
})
export class MainDesktop {

  dockItems: MenuItem[] | undefined;
  visible: boolean = false;
  dialogTitle: string = '';
  dialogContent: string = '';

  ngOnInit() {
    this.dockItems = [
      {
        label: 'Finder',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg',
        command: () => this.showDialog('Finder', 'Finder allows you to browse and organize your files. You can search for files, open them, and manage your storage.')
      },
      {
        label: 'Terminal',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/terminal.svg',
        command: () => this.showDialog('Terminal', 'Terminal gives you access to the command line interface. You can run commands, manage files, and execute scripts.')
      },
      {
        label: 'App Store',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/appstore.svg',
        command: () => this.showDialog('App Store', 'App Store is your destination for discovering and downloading apps for Mac. Browse categories, read reviews, and purchase apps.')
      },
      {
        label: 'Safari',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/safari.svg',
        command: () => this.showDialog('Safari', 'Safari is a web browser developed by Apple. Browse the internet, bookmark your favorite sites, and enjoy seamless web experience.')
      },
      {
        label: 'Photos',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/photos.svg',
        command: () => this.showDialog('Photos', 'Photos helps you organize, edit, and share your photos and videos. Create albums, apply filters, and cherish your memories.')
      },
      {
        label: 'GitHub',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/github.svg',
        command: () => this.showDialog('GitHub', 'GitHub is a platform for version control and collaboration. Host and review code, manage projects, and build software with the community.')
      },
      {
        label: 'Trash',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/trash.png',
        command: () => this.showDialog('Trash', 'Trash contains files you have deleted. You can restore files from Trash or empty it to permanently delete them.')
      }
    ];
  }

  showDialog(title: string, content: string) {
    this.dialogTitle = title;
    this.dialogContent = content;
    this.visible = true;
  }
}
