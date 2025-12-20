import { Routes } from '@angular/router';
import { BasketPage  } from '../app/shared/pages/basket-page/basket-page';
import { DetailsProductPage  } from '../app/shared/pages/details-product-page/details-product-page';
import { ProductsPage } from '../app/shared/pages/products-page/products-page';
import { Profile } from '../app/shared/pages/profile/profile';
import { HomePage } from './shared/pages/home-page/home-page';
import { ProductsDashboard } from './features/products/products-dashboard/products-dashboard';
import { CategoriesDashboard } from './features/categories/categories-dashboard/categories-dashboard';
import { ReviewsDashboard } from './features/reviews/reviews-dashboard/reviews-dashboard';
import { SalesDashboard } from './features/sales/sales-dashboard/sales-dashboard';
import { UsersDashboard } from './features/users/users-dashboard/users-dashboard';



export const routes: Routes = [
    // Redirection par défaut vers la page des produits
    // { path: '', redirectTo: 'products', pathMatch: 'full' },
    
    // Route pour la liste globale des produits
    { path: 'products', component: ProductsPage },
    
    // Route dynamique pour le détail d'un produit spécifique (:id)
    { path: 'product/:id', component: DetailsProductPage },
    
    // Route pour le panier
    { path: 'cart', component: BasketPage },
    
    // Route pour le profil (à décommenter quand prêt)
    { path: 'account', component: Profile },

    { path: '', component: HomePage },
    
    // Optionnel : Page 404 si l'URL n'existe pas
    // { path: '**', redirectTo: 'products' }
    {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics-module')
            .then(m => m.AnalyticsModule)
    },
    {
        path: 'products',
        component: ProductsDashboard
    },
    {
        path: 'categories',
        component: CategoriesDashboard
    },
    {
        path: 'reviews',
        component: ReviewsDashboard
    },
    {
        path: 'sales',
        component: SalesDashboard
    },
    {
        path: 'users',
        component: UsersDashboard
    }
  ];