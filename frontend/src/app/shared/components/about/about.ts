import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  imports: [CommonModule, MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
// Stats en Anglais
stats = [
  { value: '10K+', label: 'Happy Clients' },
  { value: '500+', label: 'Premium Products' },
  { value: '24/7', label: 'Tech Support' },
  { value: '50', label: 'Countries Served' }
];

values = [
  { 
    icon: 'verified', 
    title: 'Quality Guaranteed', 
    desc: 'We select only the best brands and products, rigorously tested by our experts.' 
  },
  { 
    icon: 'local_shipping', 
    title: 'Fast Shipping', 
    desc: 'Dispatched within 24h and securely delivered anywhere in the world.' 
  },
  { 
    icon: 'support_agent', 
    title: 'Expert Support', 
    desc: 'A team of tech enthusiasts available to answer all your technical questions.' 
  }
];

team = [
  { 
    name: 'ACHRAF EL BASRAOUI', 
    role: 'Co-Founder & Developer', 
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
  },
  { 
    name: 'ABDELKARIM AMEUR', 
    role: 'Co-Founder & Developer', 
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
  }
];

}
