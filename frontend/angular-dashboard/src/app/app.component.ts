import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 border-r border-gray-700">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-blue-500">ClawPilot</h1>
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
export class AppComponent {}
