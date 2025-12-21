import { Routes } from '@angular/router';
import { BasketPage  } from '../app/shared/pages/basket-page/basket-page';
import { DetailsProductPage  } from '../app/shared/pages/details-product-page/details-product-page';
import { ProductsPage } from '../app/shared/pages/products-page/products-page';
import { Profile } from '../app/shared/pages/profile/profile';
import { HomePage } from './shared/pages/home-page/home-page';
import { Auth } from './shared/pages/auth/auth';
import { AboutPage } from './shared/pages/about-page/about-page';
import { ContactPage } from './shared/pages/contact-page/contact-page';



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

    { path: 'about', component: AboutPage },

    { path: 'contact', component: ContactPage },


    { path: 'auth', component: Auth },
    
    // Optionnel : Page 404 si l'URL n'existe pas
    // { path: '**', redirectTo: 'products' }
    
    // Analytics module with all analytics-related routes
    {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics-module')
            .then(m => m.AnalyticsModule)
    }
  ];