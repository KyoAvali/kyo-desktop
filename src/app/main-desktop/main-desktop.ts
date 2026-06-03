import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DockModule } from 'primeng/dock';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';
import { Finder } from '../components/finder/finder';
import { TerminalComponent } from '../components/terminal/terminal';

interface PreviewFile {
    name: string;
    type: string;
    url: string;
}

@Component({
  selector: 'app-main-desktop',
  imports: [ButtonModule, DockModule, DialogModule, TooltipModule, MenubarModule, Finder, TerminalComponent],
  templateUrl: './main-desktop.html',
  styleUrl: './main-desktop.scss',
})
export class MainDesktop {

  isBrowser: boolean;
  dockItems: MenuItem[] | undefined;
  menuItems: MenuItem[] | undefined;
  dialogs: AppDialog[] = [];
  private dialogIdCounter: number = 0;

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.menuItems = [];

    this.dockItems = [
      {
        label: 'Finder',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg',
        command: () => this.openFinder()
      },
      {
        label: 'Terminal',
        icon: 'https://primefaces.org/cdn/primeng/images/dock/terminal.svg',
        command: () => this.openTerminal()
      }
    ];
  }

  openFinder() {
    this.showDialog('Finder', '', 'finder', '60vw', '400px');
  }

  openTerminal() {
    this.showDialog('Terminal', '', 'terminal', '70vw', '450px');
  }

  onFileOpened(file: PreviewFile) {
    const id = `dialog-${this.dialogIdCounter++}`;
    const newDialog: AppDialog = {
      id,
      title: file.name,
      content: '',
      type: 'preview',
      width: '80vw',
      height: '80vh',
      previewType: file.type,
      fileUrl: file.url,
      visible: true,
      loading: true
    };
    this.dialogs.push(newDialog);
    
    // Simulate loading - remove loading after small delay to show file
    setTimeout(() => {
      const dialog = this.dialogs.find(d => d.id === id);
      if (dialog) {
        dialog.loading = false;
      }
    }, 100);
  }

  showDialog(title: string, content: string, type: string = 'text', width: string = '50vw', height: string = 'auto', previewType: string = '', fileUrl: string = '') {
    const id = `dialog-${this.dialogIdCounter++}`;
    const newDialog: AppDialog = {
      id,
      title,
      content,
      type,
      width,
      height,
      previewType,
      fileUrl,
      visible: true
    };
    this.dialogs.push(newDialog);
  }

  closeDialog(id: string) {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.visible = false;
    }
  }

  removeDialog(id: string) {
    this.dialogs = this.dialogs.filter(d => d.id !== id);
  }
}

export interface AppDialog {
  id: string;
  title: string;
  content: string;
  type: string;
  width: string;
  height: string;
  previewType: string;
  fileUrl: string;
  visible: boolean;
  loading?: boolean;
}
