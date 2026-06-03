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
import { DialogService } from '../services/dialog.service';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SkeletonModule } from 'primeng/skeleton';

interface Manifest {
    folders: Record<string, FolderNode>;
}

interface FolderNode {
    folders: string[];
    files: string[];
}

interface DesktopItem {
    name: string;
    type: 'html' | 'image' | 'folder' | 'text';
    url?: string;
}

@Component({
    selector: 'app-main-desktop',
    imports: [ButtonModule, DockModule, DialogModule, TooltipModule, MenubarModule, Finder, TerminalComponent, AsyncPipe, SkeletonModule],
    templateUrl: './main-desktop.html',
    styleUrl: './main-desktop.scss',
})
export class MainDesktop implements OnInit {

    isBrowser: boolean;
    dockItems: MenuItem[] | undefined;
    menuItems: MenuItem[] | undefined;
    desktopItems: DesktopItem[] = [];
    desktopLoading = true;

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        public dialogService: DialogService,
        private http: HttpClient
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.menuItems = [];

        this.dockItems = [
            {
                label: 'Finder',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg',
                command: () => this.dialogService.openFinder()
            },
            {
                label: 'Terminal',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/terminal.svg',
                command: () => this.dialogService.openTerminal()
            }
        ];

        this.loadDesktopItems();
    }

    private loadDesktopItems() {
        if (isPlatformBrowser(this.platformId)) {
            this.desktopLoading = true;
            this.http.get<Manifest>('/files/manifest.json').subscribe({
                next: (data) => {
                    const desktopNode = data.folders['/Kyo/Desktop'];
                    if (desktopNode) {
                        this.desktopItems = [
                            ...desktopNode.folders.map(name => ({ name, type: 'folder' as const })),
                            ...desktopNode.files.map(name => this.desktopItemFromName(name))
                        ];
                    }
                    this.desktopLoading = false;
                },
                error: () => {
                    this.desktopLoading = false;
                }
            });
        }
    }

    private desktopItemFromName(name: string): DesktopItem {
        const ext = name.split('.').pop()?.toLowerCase() || '';
        let type: 'html' | 'image' | 'folder' | 'text' = 'text';
        if (['html', 'htm'].includes(ext)) type = 'html';
        else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) type = 'image';

        return {
            name,
            type,
            url: `/files/${name}`
        };
    }

    openDesktopItem(item: DesktopItem) {
        if (item.type === 'folder') {
            this.dialogService.openDialog('Finder', '', 'finder', '60vw', '400px', '', '', `/Kyo/${item.name}`);
        } else if (item.type === 'html' || item.type === 'image') {
            if (item.url) {
                this.dialogService.openPreview({ name: item.name, type: item.type, url: item.url });
            }
        }
    }

    getDesktopIcon(item: DesktopItem): string {
        switch (item.type) {
            case 'html': return '🌐';
            case 'image': return '🖼️';
            case 'folder': return '📁';
            default: return '📄';
        }
    }
}