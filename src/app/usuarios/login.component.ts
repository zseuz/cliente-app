import { AuthService } from './auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from './usuario';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  titulo: String = 'Por Favor sign In';
  usuario: Usuario;

  constructor(private authService: AuthService, private router: Router) {
    this.usuario = new Usuario();
  }

  ngOnInit(): void {

    if (this.authService.isAuthenticated()) {
      Swal.fire('Login', `Hola ${this.authService.usuario.username} ya estás autenticado!`, 'info');
      this.router.navigate(['/clientes']);
    }
  }
  login(): void {
    //console.log(this.usuario);
    if (this.usuario.username == '' || this.usuario.password == '') {
      Swal.fire('Error login', 'Username o password vacias!', 'error');
      return;
    }
    this.authService.login(this.usuario).subscribe((response) => {
      //console.log(response);

      this.authService.guardarUsuario(response.access_token);
      this.authService.guardarToken(response.access_token);
      this.router.navigate(['/clientes']);
       let usuario = this.authService.usuario;
      Swal.fire(
        'Login',
        `Hola ${usuario.username}, has iniciado sesion con exito!`,
        'success'
      );
    },
    err =>{
      if(err.status ==400){
        Swal.fire('Error login','usuario o clave incorrecta!','error');
      }
    });
  }
}
