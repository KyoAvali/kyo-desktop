import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface AppDialog {
    id: string;
    title: string;
    content: string;
    type: string;
    width: string;
    height: string;
    previewType: string;
    fileUrl: string;
    safeFileUrl?: SafeResourceUrl;
    visible: boolean;
    loading?: boolean;
    finderPath?: string;
    targetFile?: string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private dialogs$ = new BehaviorSubject<AppDialog[]>([]);
    private dialogIdCounter = 0;

    readonly dialogs = this.dialogs$.asObservable();

    constructor(
        private sanitizer: DomSanitizer,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: object
    ) {
        this.subscribeToDialogChanges();
    }

    private subscribeToDialogChanges() {
        if (!isPlatformBrowser(this.platformId)) return;

        this.dialogs$.subscribe((dialogs) => {
            const visibleDialogs = dialogs.filter(d => d.visible);
            const currentUrl = this.router.url;

            // If no dialogs are visible and we're on /finder or /terminal route, clear the URL
            if (visibleDialogs.length === 0 && (currentUrl.startsWith('/finder') || currentUrl.startsWith('/terminal'))) {
                this.router.navigateByUrl('/', { replaceUrl: true });
            }
        });
    }

    openPreview(file: { name: string; type: string; url: string }) {
        const id = `dialog-${this.dialogIdCounter++}`;
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.url);
        const newDialog: AppDialog = {
            id,
            title: file.name,
            content: '',
            type: 'preview',
            width: '80vw',
            height: '80vh',
            previewType: file.type,
            fileUrl: file.url,
            safeFileUrl: safeUrl,
            visible: true,
            loading: true
        };
        this.dialogs$.next([...this.dialogs$.getValue(), newDialog]);
        setTimeout(() => this.setLoading(id, false), 100);
    }

    openFinder(initialPath = '/Kyo') {
        this.openDialog('Finder', '', 'finder', '60vw', '400px', '', '', initialPath);
    }

    openTerminal() {
        this.openDialog('Terminal', '', 'terminal', '70vw', '450px');
    }

    openDialog(title: string, content: string, type: string, width: string, height: string, previewType = '', fileUrl = '', finderPath = '', targetFile = '') {
        const id = `dialog-${this.dialogIdCounter++}`;
        this.dialogs$.next([...this.dialogs$.getValue(), {
            id, title, content, type, width, height, previewType, fileUrl, visible: true, finderPath, targetFile
        }]);
    }

    close(id: string) {
        const dialogs = this.dialogs$.getValue().map(d =>
            d.id === id ? { ...d, visible: false } : d
        );
        this.dialogs$.next(dialogs);
        
        // Remove the dialog after a short delay to allow for animation
        setTimeout(() => this.remove(id), 300);
    }

    remove(id: string) {
        this.dialogs$.next(this.dialogs$.getValue().filter(d => d.id !== id));
    }

    private setLoading(id: string, loading: boolean) {
        const dialogs = this.dialogs$.getValue().map(d =>
            d.id === id ? { ...d, loading } : d
        );
        this.dialogs$.next(dialogs);
    }
}