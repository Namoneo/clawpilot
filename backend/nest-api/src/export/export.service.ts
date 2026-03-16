import { Injectable } from '@nestjs/common';

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  YAML = 'yaml',
}

export enum ExportType {
  AGENTS = 'agents',
  RUNS = 'runs',
  TEMPLATES = 'templates',
  METRICS = 'metrics',
}

@Injectable()
export class ExportService {
  
  async exportData(data: any[], format: ExportFormat): Promise<string> {
    switch (format) {
      case ExportFormat.JSON:
        return this.toJSON(data);
      case ExportFormat.CSV:
        return this.toCSV(data);
      case ExportFormat.YAML:
        return this.toYAML(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private toJSON(data: any[]): string {
    return JSON.stringify(data, null, 2);
  }

  private toCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }

  private toYAML(data: any[]): string {
    return data.map(item => this.objectToYAML(item)).join('\n---\n');
  }

  private objectToYAML(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n${this.objectToYAML(value, indent + 1)}`;
      } else if (typeof value === 'string') {
        yaml += `${spaces}${key}: "${value}"\n`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  async importData(type: ExportType, content: string, format: ExportFormat): Promise<any> {
    switch (format) {
      case ExportFormat.JSON:
        return JSON.parse(content);
      default:
        throw new Error(`Import not supported for format: ${format}`);
    }
  }

  generateFilename(type: ExportType, format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `clawpilot-${type}-${timestamp}.${format}`;
  }
}
