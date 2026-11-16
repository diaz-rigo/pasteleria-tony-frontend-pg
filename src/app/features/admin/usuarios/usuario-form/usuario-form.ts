import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Usuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  @Input() usuario: Usuario | null = null;
  @Output() guardar = new EventEmitter<Partial<Usuario>>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    strUsuEmail: ['', [Validators.required, Validators.email]],
    strUsuPassword: [''],
    strUsuRol: ['CLIENT', Validators.required],
    strUsuNombre: ['', Validators.required],
    strUsuApellidoPaterno: [''],
    strUsuApellidoMaterno: [''],
    strUsuTelefono: [''],
    strUsuEstado: ['ACTIVE', Validators.required],
  });

  ngOnChanges(): void {
    const password = this.form.controls.strUsuPassword;
    password.setValidators(this.usuario ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]);
    password.updateValueAndValidity({ emitEvent: false });
    if (this.usuario) {
      this.form.patchValue({
        strUsuEmail: this.usuario.strUsuEmail,
        strUsuRol: this.usuario.strUsuRol,
        strUsuNombre: this.usuario.strUsuNombre,
        strUsuApellidoPaterno: this.usuario.strUsuApellidoPaterno || '',
        strUsuApellidoMaterno: this.usuario.strUsuApellidoMaterno || '',
        strUsuTelefono: this.usuario.strUsuTelefono || '',
        strUsuEstado: this.usuario.strUsuEstado,
      });
    } else {
      this.form.reset({ strUsuRol: 'CLIENT', strUsuEstado: 'ACTIVE' });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const data: Partial<Usuario> = {
      strUsuEmail: raw.strUsuEmail,
      strUsuRol: raw.strUsuRol,
      strUsuNombre: raw.strUsuNombre,
      strUsuApellidoPaterno: raw.strUsuApellidoPaterno,
      strUsuApellidoMaterno: raw.strUsuApellidoMaterno,
      strUsuTelefono: raw.strUsuTelefono,
      strUsuEstado: raw.strUsuEstado,
    };
    if (raw.strUsuPassword) data.strUsuPassword = raw.strUsuPassword;
    this.guardar.emit(data);
  }
}
