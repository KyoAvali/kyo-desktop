import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private dialogs$ = new BehaviorSubject<AppDialog[]>([]);
    private dialogIdCounter = 0;

    readonly dialogs = this.dialogs$.asObservable();

    constructor(
        private sanitizer: DomSanitizer
    ) {}

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

    openDialog(title: string, content: string, type: string, width: string, height: string, previewType = '', fileUrl = '', finderPath = '') {
        const id = `dialog-${this.dialogIdCounter++}`;
        this.dialogs$.next([...this.dialogs$.getValue(), {
            id, title, content, type, width, height, previewType, fileUrl, visible: true, finderPath
        }]);
    }

    close(id: string) {
        const dialogs = this.dialogs$.getValue().map(d =>
            d.id === id ? { ...d, visible: false } : d
        );
        this.dialogs$.next(dialogs);
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