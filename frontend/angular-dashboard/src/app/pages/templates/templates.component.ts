import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-8">Agent Templates</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (template of templates; track template.id) {
          <div class="card">
            <h3 class="text-xl font-semibold mb-2">{{ template.name }}</h3>
            <p class="text-gray-400 mb-4">{{ template.description }}</p>
            <div class="text-sm text-gray-500 mb-4">
              <div class="mb-1"><strong>Planning:</strong> {{ template.routing.planning }}</div>
              <div class="mb-1"><strong>Coding:</strong> {{ template.routing.coding }}</div>
              <div class="mb-1"><strong>Review:</strong> {{ template.routing.review }}</div>
              <div><strong>Chat:</strong> {{ template.routing.chat }}</div>
            </div>
            <button class="btn btn-primary w-full">Use Template</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class TemplatesComponent {
  templates = [
    {
      id: 'developer-assistant',
      name: 'Developer Assistant',
      description: 'AI coding assistant for software development',
      routing: {
        planning: 'claude-3.5-sonnet',
        coding: 'deepseek-coder-v2',
        review: 'claude-3.5-sonnet',
        chat: 'llama3.1:8b',
      },
    },
    {
      id: 'research-agent',
      name: 'Research Agent',
      description: 'AI agent for research and documentation',
      routing: {
        planning: 'claude-3.5-sonnet',
        coding: 'qwen2.5:7b',
        review: 'claude-3.5-sonnet',
        chat: 'llama3.1:8b',
      },
    },
    {
      id: 'automation-agent',
      name: 'Automation Agent',
      description: 'AI agent for task automation',
      routing: {
        planning: 'claude-3.5-sonnet',
        coding: 'deepseek-coder-v2',
        review: 'llama3.1:8b',
        chat: 'llama3.1:8b',
      },
    },
  ];
}
