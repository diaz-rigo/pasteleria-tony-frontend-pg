import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../store/auth/auth.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private router = inject(Router);

  readonly cargando = this.auth.cargando;

  form = this.fb.nonNullable.group({
    strUsuEmail: ['', [Validators.required, Validators.email]],
    strUsuPassword: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { strUsuEmail, strUsuPassword } = this.form.getRawValue();
    this.auth.login(strUsuEmail, strUsuPassword);
  }
}
