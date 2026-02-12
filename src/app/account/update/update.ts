import { UserService } from '@/user.service';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-update',
  imports: [FormsModule],
  templateUrl: './update.html',
  styleUrl: './update.css',
})
export class Update {
  private userService = inject(UserService);

  user = { ...this.userService.loadedCurrentUser() };

  // TEMPLATE DRIVEN
  onSubmit(formData: NgForm) {
    console.log(formData.form.value);
    // const enteredName = formData.form.value.firstName;
  }
}
