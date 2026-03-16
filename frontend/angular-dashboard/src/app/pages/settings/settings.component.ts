import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-8">Settings</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Profile Settings -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Profile</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Name</label>
              <input class="input" value="Sherzod">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Email</label>
              <input class="input" value="uzpartner@gmail.com" disabled>
            </div>
            <button class="btn btn-primary">Update Profile</button>
          </div>
        </div>

        <!-- API Keys -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">API Keys</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">OpenRouter API Key</label>
              <input type="password" class="input" placeholder="sk-or-...">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">OpenAI API Key</label>
              <input type="password" class="input" placeholder="sk-...">
            </div>
            <button class="btn btn-primary">Save Keys</button>
          </div>
        </div>

        <!-- Billing -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Billing</h2>
          <div class="mb-4">
            <span class="badge badge-success">Free Plan</span>
          </div>
          <p class="text-gray-400 mb-4">1 agent allowed</p>
          <button class="btn btn-primary">Upgrade Plan</button>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {}
