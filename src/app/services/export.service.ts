// src/app/services/export.service.ts
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportAsCSV(data: any[], filename: string) {
    const csv = this.convertToCSV(data);
    this.download(csv, filename, 'text/csv');
  }

  exportAsJSON(data: any[], filename: string) {
    const json = JSON.stringify(data, null, 2);
    this.download(json, filename, 'application/json');
  }

  exportAsTXT(data: any[], filename: string) {
    const txt = data.map((row) => Object.values(row).join('\t')).join('\n');
    this.download(txt, filename, 'text/plain');
  }

  exportAsSQL(data: any[], tableName: string, filename: string) {
    const columns = Object.keys(data[0]);
    const values = data.map(
      (row) => `(${columns.map((col) => `'${row[col]}'`).join(', ')})`
    );
    const sql = `INSERT INTO ${tableName} (${columns.join(
      ', '
    )}) VALUES\n${values.join(',\n')};`;
    this.download(sql, filename, 'text/sql');
  }

  private download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    saveAs(blob, filename);
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((field) => `"${row[field]}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
