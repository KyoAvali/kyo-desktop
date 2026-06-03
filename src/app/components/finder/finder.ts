import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Manifest {
    folders: Record<string, FolderNode>;
}

interface FolderNode {
    folders: string[];
    files: string[];
}

@Component({
    selector: 'app-finder',
    imports: [CommonModule],
    templateUrl: './finder.html',
    styleUrl: './finder.scss'
})
export class Finder implements OnInit {
    currentPath = '/Desktop';
    currentFiles: FileInfo[] = [];
    currentFolders: string[] = [];

    @Output() fileOpened = new EventEmitter<PreviewFile>();

    private manifest: Manifest | null = null;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: object
    ) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadManifest();
        }
    }

    private loadManifest() {
        this.http.get<Manifest>('/files/manifest.json').subscribe({
            next: (data) => {
                this.manifest = data;
                this.loadFolder('/Desktop');
            },
            error: (err) => {
                console.error('Failed to load finder manifest', err);
                this.loadFolder('/Desktop');
            }
        });
    }

    navigateTo(location: string) {
        const path = `/Desktop/${location.charAt(0).toUpperCase() + location.slice(1)}`;
        this.loadFolder(path);
    }

    openFolder(folder: string) {
        const path = `${this.currentPath}/${folder}`;
        this.loadFolder(path);
    }

    loadFolder(path: string) {
        this.currentPath = path;
        if (this.manifest && this.manifest.folders[path]) {
            const node = this.manifest.folders[path];
            this.currentFolders = node.folders;
            this.currentFiles = node.files.map((name) => this.fileFromName(name));
        } else {
            this.currentFolders = [];
            this.currentFiles = [];
        }
    }

    private fileFromName(name: string): FileInfo {
        const ext = name.split('.').pop()?.toLowerCase() || '';
        let type = 'text';
        if (ext === 'html' || ext === 'htm') type = 'html';
        else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) type = 'image';

        return {
            name,
            type,
            size: 0,
            url: `/files/${name}`
        };
    }

    openFile(file: FileInfo) {
        if ((file.type === 'html' || file.type === 'image') && file.url) {
            this.fileOpened.emit({
                name: file.name,
                type: file.type,
                url: file.url
            });
        }
    }

    getFileIcon(name: string): string {
        const ext = name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'html': return '🌐';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg': return '🖼️';
            case 'txt': return '📝';
            case 'pdf': return '📕';
            case 'css': return '🎨';
            case 'js': return '⚡';
            default: return '📄';
        }
    }

    formatSize(bytes: number): string {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

interface FileInfo {
    name: string;
    type: string;
    size: number;
    url?: string;
}

interface PreviewFile {
    name: string;
    type: string;
    url: string;
}
