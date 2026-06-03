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
import { UrlParameterService } from '../services/url-parameter.service';
import { ManifestService } from '../services/manifest.service';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SkeletonModule } from 'primeng/skeleton';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';

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
    imports: [ButtonModule, DockModule, DialogModule, TooltipModule, MenubarModule, Finder, TerminalComponent, AsyncPipe, SkeletonModule, RouterModule],
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
        private http: HttpClient,
        private router: Router,
        private urlParameterService: UrlParameterService,
        private manifestService: ManifestService
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        // Make dialog service globally accessible for URL parameter service
        if (isPlatformBrowser(this.platformId)) {
            (window as any).dialogService = this.dialogService;
        }

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
        this.handleRouteChanges();
    }

    private loadDesktopItems() {
        if (!isPlatformBrowser(this.platformId)) return;

        this.desktopLoading = true;
        const manifest = this.manifestService.getManifestSync();
        
        if (manifest) {
            // If manifest is cached, still show skeleton briefly for smooth UX
            setTimeout(() => {
                this.loadDesktopItemsFromManifest(manifest);
            }, 300);
        } else {
            this.manifestService.getManifest().subscribe({
                next: (manifest) => {
                    this.loadDesktopItemsFromManifest(manifest);
                },
                error: () => {
                    this.loadDesktopItemsFallback();
                }
            });
        }
    }

    private loadDesktopItemsFromManifest(manifest: Manifest | null) {
        // Keep loading state for minimum time to prevent flicker
        setTimeout(() => {
            if (manifest) {
                const desktopNode = manifest.folders['/Kyo/Desktop'];
                if (desktopNode) {
                    this.desktopItems = [
                        ...desktopNode.folders.map(name => ({ name, type: 'folder' as const })),
                        ...desktopNode.files.map(name => this.desktopItemFromName(name))
                    ];
                }
            }
            this.desktopLoading = false;
        }, 200);
    }

    private loadDesktopItemsFallback() {
        setTimeout(() => {
            this.desktopItems = [
                { name: 'Documents', type: 'folder' as const },
                { name: 'Images', type: 'folder' as const }
            ];
            this.desktopLoading = false;
        }, 200);
    }

    private handleRouteChanges() {
        if (!isPlatformBrowser(this.platformId)) return;

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.urlParameterService.processUrlParams();
            }
        });
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