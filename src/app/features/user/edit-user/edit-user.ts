import { UserService } from '@/core/services/user.service';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  imports: [FormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {
  private userService = inject(UserService);

  user = { ...this.userService.loadedCurrentUser() };

  // TEMPLATE DRIVEN
  onSubmit(formData: NgForm) {
    console.log(formData.form.value);
    // const enteredName = formData.form.value.firstName;
  }
}
