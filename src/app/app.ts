import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainDesktop } from "./main-desktop/main-desktop";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainDesktop],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('kyo-desktop');
}
