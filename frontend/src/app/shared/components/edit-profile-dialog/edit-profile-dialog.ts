import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour le *ngFor
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true, // Important si vous utilisez 'imports'
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,    // On importe le MODULE, pas le service
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './edit-profile-dialog.html',
  styleUrl: './edit-profile-dialog.css',
})
export class EditProfileDialog {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProfileDialog>, // Le service reste ici
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const formControls: any = {};
    data.fields.forEach((field: any) => {
      formControls[field.name] = [field.value || ''];
    });
    this.editForm = this.fb.group(formControls);
  }

  onSave() {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}