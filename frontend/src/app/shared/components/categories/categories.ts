import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryInfo } from '../../../core/models/categoryInfo.model';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; 
import { CategoryService } from '../../../core/services/category.service';



@Component({
  selector: 'app-categories',
  imports: [MatIconModule, CommonModule ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
}) 
export class Categories implements OnInit{

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}



  categories: CategoryInfo[] = [];

  ngOnInit(): void {
    this.loadCategories();
    this.cdr.detectChanges();
  }

  loadCategories(){
    this.categoryService.getCategoryDetails().subscribe((data) => {
      this.categories = data;
      console.log(data);
      this.cdr.detectChanges(); 
    })
  }



// Filtrer pour ne montrer que les catégories actives
  get activeCategories() {
    return this.categories.filter(c => c.isActive);
  }

  navigateToCategory(categoryName: string) {
    // Navigation vers le composant CategoryProducts que nous avons créé précédemment
    this.router.navigate(['/category', categoryName]);
  }
}
