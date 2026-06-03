import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

interface Manifest {
    folders: Record<string, FolderNode>;
}

interface FolderNode {
    folders: string[];
    files: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ManifestService {
    private manifest$ = new BehaviorSubject<Manifest | null>(null);
    private loading$ = new BehaviorSubject<boolean>(false);
    private loading = false;

    constructor(private http: HttpClient) {}

    getManifest(): Observable<Manifest> {
        if (this.manifest$.value) {
            return this.manifest$.asObservable() as Observable<Manifest>;
        }

        if (!this.loading) {
            this.loading = true;
            this.loading$.next(true);
            
            this.http.get<Manifest>('/files/manifest.json').subscribe({
                next: (data) => {
                    this.manifest$.next(data);
                    this.loading = false;
                    this.loading$.next(false);
                },
                error: (err) => {
                    console.error('Failed to load manifest', err);
                    this.loading = false;
                    this.loading$.next(false);
                }
            });
        }

        return this.manifest$.asObservable() as Observable<Manifest>;
    }

    getManifestSync(): Manifest | null {
        return this.manifest$.value;
    }

    isLoading(): Observable<boolean> {
        return this.loading$.asObservable();
    }
}
