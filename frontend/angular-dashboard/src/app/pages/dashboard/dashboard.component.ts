import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="text-gray-400 text-sm">Active Agents</div>
          <div class="text-3xl font-bold text-blue-500 mt-2">0</div>
        </div>
        <div class="card">
          <div class="text-gray-400 text-sm">Total Agents</div>
          <div class="text-3xl font-bold mt-2">0</div>
        </div>
        <div class="card">
          <div class="text-gray-400 text-sm">Tokens Used</div>
          <div class="text-3xl font-bold text-green-500 mt-2">0</div>
        </div>
        <div class="card">
          <div class="text-gray-400 text-sm">Runs Today</div>
          <div class="text-3xl font-bold text-purple-500 mt-2">0</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Recent Runs</h2>
        <div class="text-gray-400 text-center py-8">
          No recent activity. Start an agent to see runs here.
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
