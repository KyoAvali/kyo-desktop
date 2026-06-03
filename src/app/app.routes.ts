import { Routes } from '@angular/router';
import { MainDesktop } from './main-desktop/main-desktop';

export const routes: Routes = [
    {
        path: '',
        component: MainDesktop,
        pathMatch: 'full'
    },
    {
        path: 'finder',
        component: MainDesktop
    },
    {
        path: 'terminal',
        component: MainDesktop
    }
];
