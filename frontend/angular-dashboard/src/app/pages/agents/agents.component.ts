import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Agent {
  id: number;
  name: string;
  templateId: string;
  status: 'running' | 'stopped';
  createdAt: Date;
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Agents</h1>
        <button (click)="showCreateModal = true" class="btn btn-primary">
          + New Agent
        </button>
      </div>

      <!-- Agents Table -->
      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Template</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (agent of agents(); track agent.id) {
              <tr>
                <td class="font-medium">{{ agent.name }}</td>
                <td>{{ agent.templateId }}</td>
                <td>
                  <span [class]="agent.status === 'running' ? 'badge badge-success' : 'badge badge-warning'">
                    {{ agent.status }}
                  </span>
                </td>
                <td>{{ agent.createdAt | date:'short' }}</td>
                <td>
                  @if (agent.status === 'running') {
                    <button (click)="stopAgent(agent.id)" class="btn btn-danger text-sm">
                      Stop
                    </button>
                  } @else {
                    <button (click)="startAgent(agent.id)" class="btn btn-success text-sm">
                      Start
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center py-8 text-gray-400">
                  No agents yet. Create one to get started.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="card w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Create New Agent</h2>
            <input 
              [(ngModel)]="newAgentName" 
              placeholder="Agent name" 
              class="input mb-4"
            >
            <select [(ngModel)]="newAgentTemplate" class="input mb-4">
              <option value="">Select template...</option>
              <option value="developer-assistant">Developer Assistant</option>
              <option value="research-agent">Research Agent</option>
              <option value="automation-agent">Automation Agent</option>
            </select>
            <div class="flex gap-2">
              <button (click)="createAgent()" class="btn btn-primary">Create</button>
              <button (click)="showCreateModal = false" class="btn bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AgentsComponent {
  agents = signal<Agent[]>([]);
  showCreateModal = false;
  newAgentName = '';
  newAgentTemplate = '';

  createAgent() {
    // API call would go here
    console.log('Creating agent:', this.newAgentName, this.newAgentTemplate);
    this.showCreateModal = false;
    this.newAgentName = '';
    this.newAgentTemplate = '';
  }

  startAgent(id: number) {
    console.log('Starting agent:', id);
  }

  stopAgent(id: number) {
    console.log('Stopping agent:', id);
  }
}
