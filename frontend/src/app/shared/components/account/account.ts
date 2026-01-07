import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ProfileModel } from '../../../core/models/profile.model';
import { UsersService } from '../../../core/services/users.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from "../../../core/services/auth.service";
import { Router } from '@angular/router';


@Component({
  selector: 'app-account',
  imports: [MatIconModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private usersService: UsersService,
    private router: Router
  ) {}

  // @Input() userId!: number;
  // userId = 3;

  profileModel!: ProfileModel;

  loadUsersProfile(){
    this.usersService.getUsersProfile().subscribe((data) => {
      this.profileModel = data;
      console.log('Données reçues :', data)
      this.cdr.detectChanges();
    })
  }

 
  ngOnInit(): void {
    // Vérifier d'abord si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      this.loadUsersProfile();
      // this.loadSearchHistory(); 
      // this.updateCartCount();
    } else {
      console.log("Utilisateur non connecté (Mode Invité)");
    }
  }

  onEdit(section: string) {
    let dialogConfig = {
      width: '750px',
      data: {}
    };
  
    if (section === 'personal' || section === 'header') {
      dialogConfig.data = {
        title: 'Edit Personal Information',
        fields: [
          { name: 'firstName', label: 'First Name', value: this.profileModel.firstName },
          { name: 'lastName', label: 'Last Name', value: this.profileModel.lastName },
          { name: 'email', label: 'Email', value: this.profileModel.email },
          { name: 'phoneNumber', label: 'Phone Number', value: this.profileModel.phoneNumber },
          { name: 'bio', label: 'Bio', value: this.profileModel.bio, fullWidth: true },
          
          // { name: 'facebook', label: 'Facebook URL', value: '' }, 
          // { name: 'twitter', label: 'Twitter URL', value: '' }
        ]
      };
    } 
    
    else if (section === 'address') {
      dialogConfig.data = {
        title: 'Edit Address',
        fields: [
          { name: 'country', label: 'Country', value: this.profileModel.country },
          { name: 'cityState', label: 'City ', value: this.profileModel.city },
          { name: 'postalCode', label: 'Postal Code', value: this.profileModel.postalCode }
        ]
      };
    }
  
    const dialogRef = this.dialog.open(EditProfileDialog, dialogConfig);
  
    // Récupération des données après la fermeture
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        const updatedData: ProfileModel = { ...this.profileModel, ...result };
  
        this.usersService.updateUserProfile(updatedData).subscribe({
          next: (response) => {

            this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
            
            // this.loadUsersProfile(this.userId);
  
            this.profileModel = { ...this.profileModel, ...result };
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.snackBar.open('Profile not updated successfully!', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    
    this.snackBar.open('You have been logged out.', 'Close', { duration: 3000 });
    
    this.router.navigate(['/auth']);
  }
}
