import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DialogService } from '../../services/dialog.service';

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
export class Finder implements OnInit, OnChanges {
    currentPath = '/Kyo';
    currentFiles: FileInfo[] = [];
    currentFolders: string[] = [];

    @Input() initialPath: string = '/Kyo';

    private manifest: Manifest | null = null;

    constructor(
        private http: HttpClient,
        private dialogService: DialogService,
        @Inject(PLATFORM_ID) private platformId: object
    ) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadManifest();
        }
    }

    ngOnChanges() {
        if (this.manifest && this.initialPath) {
            this.loadFolder(this.initialPath);
        }
    }

    private loadManifest() {
        this.http.get<Manifest>('/files/manifest.json').subscribe({
            next: (data) => {
                this.manifest = data;
                this.loadFolder(this.initialPath || '/Kyo');
            },
            error: (err) => {
                console.error('Failed to load finder manifest', err);
                this.loadFolder(this.initialPath || '/Kyo');
            }
        });
    }

    navigateTo(location: string) {
        if (location === 'kyo') {
            this.loadFolder('/Kyo');
        } else {
            const path = `/Kyo/${location.charAt(0).toUpperCase() + location.slice(1)}`;
            this.loadFolder(path);
        }
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
            this.dialogService.openPreview({ name: file.name, type: file.type, url: file.url });
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