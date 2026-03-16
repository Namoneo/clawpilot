import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-8">Logs</h1>
      
      <div class="card">
        <div class="text-gray-400 text-center py-8">
          No logs yet. Start an agent to see logs here.
        </div>
      </div>
    </div>
  `,
})
export class LogsComponent {}
