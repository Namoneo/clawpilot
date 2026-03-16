import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex" [class.light]="isLightMode()">
      <!-- Sidebar -->
      <aside class="w-64 sidebar border-r">
        <div class="p-6 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-500">ClawPilot</h1>
          <button 
            (click)="toggleMode()" 
            class="text-xl"
            [title]="isLightMode() ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
          >
            {{ isLightMode() ? '🌙' : '☀️' }}
          </button>
        </div>
        <nav class="mt-6">
          <a routerLink="/dashboard" routerLinkActive="bg-gray-700" class="block px-6 py-3 hover:bg-gray-700 transition">
            📊 Dashboard
          </a>
          <a routerLink="/agents" routerLinkActive="bg-gray-700" class="block px-6 py-3 hover:bg-gray-700 transition">
            🤖 Agents
          </a>
          <a routerLink="/templates" routerLinkActive="bg-gray-700" class="block px-6 py-3 hover:bg-gray-700 transition">
            📋 Templates
          </a>
          <a routerLink="/logs" routerLinkActive="bg-gray-700" class="block px-6 py-3 hover:bg-gray-700 transition">
            📝 Logs
          </a>
          <a routerLink="/settings" routerLinkActive="bg-gray-700" class="block px-6 py-3 hover:bg-gray-700 transition">
            ⚙️ Settings
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent {
  isLightMode = signal(false);

  toggleMode() {
    this.isLightMode.update(v => !v);
    if (this.isLightMode()) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', this.isLightMode() ? 'light' : 'dark');
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isLightMode.set(true);
      document.body.classList.add('light');
    }
  }
}
