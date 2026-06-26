import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export function parseCSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  return records as T[];
}

export function readAllPBLFiles(): Record<string, unknown>[] {
  const dataDir = path.join(__dirname, '../../data/pbl');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  const allRecords: Record<string, unknown>[] = [];
  for (const file of files) {
    const records = parseCSV<Record<string, unknown>>(path.join(dataDir, file));
    allRecords.push(...records);
  }
  return allRecords;
}

export function readGrantFinanceFile(): Record<string, unknown>[] {
  const filePath = path.join(__dirname, '../../data/grants/grant_finance.csv');
  return parseCSV<Record<string, unknown>>(filePath);
}

export function readGrantPerformanceFile(): Record<string, unknown>[] {
  const filePath = path.join(__dirname, '../../data/grants/grant_performance.csv');
  return parseCSV<Record<string, unknown>>(filePath);
}

export function readGrantMediaFile(): Record<string, unknown>[] {
  const filePath = path.join(__dirname, '../../data/grants/grant_media.csv');
  return parseCSV<Record<string, unknown>>(filePath);
}