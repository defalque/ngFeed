import { Component, effect, inject, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideAngularModule, XIcon } from 'lucide-angular';
import { ToastService } from '@/core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [A11yModule, LucideAngularModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {}
