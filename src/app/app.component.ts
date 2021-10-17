import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  pages: { url: string; direction: any; icon: string; text: string }[];
  user: firebase.default.User;


  constructor(private authService: AuthService) {
    this.initializeApp();
  }

  initializeApp() {
    this.authService.authState$.subscribe((user) => {
      this.user = user;
    });

    this.pages = [
      {
        url: '/tasks',
        icon: 'home-outline',
        direction: 'back',
        text: 'Home',
      },
      {
        url: '/responsaveis',
        icon: 'man-outline',
        direction: 'forward',
        text: 'Responsáveis',
      },
      {
        url: '/etiquetas/create',
        icon: 'add-circle-outline',
        direction: 'forward',
        text: 'Nova Etiqueta',
      },
      {
        url: '/responsaveis/create',
        icon: 'add-circle-outline',
        direction: 'forward',
        text: 'Novo Responsável',
      },
      {
        url: '/tasks/create',
        icon: 'add',
        direction: 'forward',
        text: 'Nova Tarefa',
      },
    ];
  }

}
