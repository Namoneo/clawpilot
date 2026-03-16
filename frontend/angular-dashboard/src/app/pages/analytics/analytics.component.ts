import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface MetricCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  values: number[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Analytics</h1>
        <select 
          [(ngModel)]="timeRange" 
          (ngModelChange)="loadData()"
          class="input w-40"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <!-- Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        @for (metric of metrics(); track metric.title) {
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">{{ metric.title }}</p>
                <p class="text-3xl font-bold mt-2" [class]="metric.color">{{ metric.value }}</p>
              </div>
              <span class="text-4xl">{{ metric.icon }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Token Usage Chart -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Token Usage Over Time</h3>
          <div class="h-64 flex items-end justify-between gap-2">
            @for (bar of tokenChart().values; track $index) {
              <div class="flex-1 bg-blue-600 rounded-t" [style.height.%]="bar"></div>
            }
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-400">
            @for (label of tokenChart().labels; track label) {
              <span>{{ label }}</span>
            }
          </div>
        </div>

        <!-- Agent Runs Chart -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Agent Runs</h3>
          <div class="h-64 flex items-end justify-between gap-2">
            @for (bar of runsChart().values; track $index) {
              <div class="flex-1 bg-green-600 rounded-t" [style.height.%]="bar"></div>
            }
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-400">
            @for (label of runsChart().labels; track label) {
              <span>{{ label }}</span>
            }
          </div>
        </div>
      </div>

      <!-- Top Agents -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">Top Performing Agents</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Runs</th>
              <th>Success Rate</th>
              <th>Tokens Used</th>
            </tr>
          </thead>
          <tbody>
            @for (agent of topAgents(); track agent.name) {
              <tr>
                <td>{{ agent.name }}</td>
                <td>{{ agent.runs }}</td>
                <td>
                  <span class="badge" [class]="agent.successRate > 80 ? 'badge-success' : 'badge-warning'">
                    {{ agent.successRate }}%
                  </span>
                </td>
                <td>{{ agent.tokens | number }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit {
  timeRange = '7';
  
  metrics = signal<MetricCard[]>([
    { title: 'Total Runs', value: 0, icon: '🔄', color: 'text-blue-500' },
    { title: 'Success Rate', value: '0%', icon: '✅', color: 'text-green-500' },
    { title: 'Tokens Used', value: 0, icon: '🪙', color: 'text-yellow-500' },
    { title: 'Avg Duration', value: '0s', icon: '⏱️', color: 'text-purple-500' },
  ]);

  tokenChart = signal<ChartData>({ labels: [], values: [] });
  runsChart = signal<ChartData>({ labels: [], values: [] });
  
  topAgents = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Mock data - in production, fetch from API
    this.metrics.set([
      { title: 'Total Runs', value: 156, icon: '🔄', color: 'text-blue-500' },
      { title: 'Success Rate', value: '94%', icon: '✅', color: 'text-green-500' },
      { title: 'Tokens Used', value: '2.4M', icon: '🪙', color: 'text-yellow-500' },
      { title: 'Avg Duration', value: '45s', icon: '⏱️', color: 'text-purple-500' },
    ]);

    this.tokenChart.set({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [30, 45, 60, 40, 75, 55, 80],
    });

    this.runsChart.set({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [15, 22, 30, 20, 35, 25, 40],
    });

    this.topAgents.set([
      { name: 'Dev Assistant', runs: 45, successRate: 98, tokens: 850000 },
      { name: 'Research Agent', runs: 32, successRate: 95, tokens: 620000 },
      { name: 'Automation Bot', runs: 28, successRate: 89, tokens: 450000 },
      { name: 'Data Analyst', runs: 22, successRate: 91, tokens: 380000 },
      { name: 'Security Scanner', runs: 18, successRate: 100, tokens: 120000 },
    ]);
  }
}
