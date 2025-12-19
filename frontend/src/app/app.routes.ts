import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics-module')
        .then(m => m.AnalyticsModule)
    },
    /*{
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full'
    }*/
];
