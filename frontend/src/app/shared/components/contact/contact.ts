import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit{
  contactForm!: FormGroup;
  isSubmitting = false;
  successMessage = false;

  // Données de contact
  contactInfo = [
    { icon: 'location_on', title: 'Address', content: 'École Nationale des Sciences Appliquées, BP 77 Bd Beni Amir, Khouribga 25000' },
    { icon: 'phone', title: 'Phone', content: '+212 691763687' },
    { icon: 'email', title: 'Email', content: 'support@salesiq.com' },
    { icon: 'schedule', title: 'Working Hours', content: 'Mon - Fri: 9:00 AM - 6:00 PM' }
  ];

  // FAQ rapide
  faqs = [
    { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide via trusted carriers.' },
    { question: 'What is the return policy?', answer: 'You can return any product within 30 days of purchase if it remains unopened.' },
    { question: 'How can I track my order?', answer: 'Once shipped, you will receive a tracking link via email.' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Getters pour faciliter l'accès dans le HTML
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulation d'appel API
      setTimeout(() => {
        console.log('Form Submitted', this.contactForm.value);
        this.isSubmitting = false;
        this.successMessage = true;
        this.contactForm.reset();
        
        // Cacher le message de succès après 5 secondes
        setTimeout(() => this.successMessage = false, 5000);
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
