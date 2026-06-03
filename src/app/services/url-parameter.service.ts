import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UrlParameterService {
    constructor(private router: Router) {}

    processUrlParams(): void {
        if (typeof window === 'undefined') return;

        const url = new URL(window.location.href);
        const path = url.pathname;
        const params = url.searchParams;

        if (path === '/finder') {
            this.processFinderParams(params);
        } else if (path === '/terminal') {
            this.openTerminal();
        }
    }

    private processFinderParams(params: URLSearchParams): void {
        const folder = params.get('folder');
        const file = params.get('file');

        if (file) {
            // If file parameter is provided, open file preview dialog ONLY
            this.openFilePreview(file);
        } else if (folder) {
            // If only folder parameter is provided, open Finder dialog at that folder
            this.openFinder(folder);
        } else {
            // If no file or folder parameter, open Finder at root
            this.openFinder('/Kyo');
        }
    }

    private openFilePreview(fileName: string): void {
        const dialogService = (window as any).dialogService;
        if (dialogService) {
            dialogService.openPreview({
                name: fileName,
                type: this.getFileType(fileName),
                url: `/files/${fileName}`
            });
        }
    }

    private openFinder(folderPath: string): void {
        const dialogService = (window as any).dialogService;
        if (dialogService) {
            dialogService.openFinder(folderPath);
        }
    }

    private openTerminal(): void {
        const dialogService = (window as any).dialogService;
        if (dialogService) {
            dialogService.openTerminal();
        }
    }

    private getFileType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['html', 'htm'].includes(ext)) return 'html';
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
        return 'text';
    }

    getUrlPath(itemName: string, itemType: 'file' | 'folder', currentPath: string): string {
        if (itemType === 'file') {
            return `${window.location.origin}/finder?file=${encodeURIComponent(itemName)}`;
        } else {
            return `${window.location.origin}/finder?folder=${encodeURIComponent(currentPath)}`;
        }
    }
}