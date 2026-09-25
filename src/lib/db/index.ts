import { 
  UserProfile, 
  DiseaseDiagnosis, 
  YieldPredictionResult, 
  KvkCenter, 
  RegionalAlert, 
  AdminActivityLog 
} from '@/types';
import { 
  INITIAL_USERS, 
  INITIAL_KVK_CENTERS, 
  INITIAL_DISEASE_SCANS, 
  INITIAL_YIELD_PREDICTIONS, 
  INITIAL_REGIONAL_ALERTS, 
  INITIAL_ADMIN_LOGS 
} from './mockData';

// Singleton in-memory store for serverless and dev execution
class Store {
  users: Map<string, UserProfile> = new Map();
  kvkCenters: Map<string, KvkCenter> = new Map();
  scans: Map<string, DiseaseDiagnosis> = new Map();
  yieldPredictions: Map<string, YieldPredictionResult> = new Map();
  alerts: Map<string, RegionalAlert> = new Map();
  adminLogs: AdminActivityLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    INITIAL_USERS.forEach(u => this.users.set(u.id, { ...u }));
    INITIAL_KVK_CENTERS.forEach(k => this.kvkCenters.set(k.id, { ...k }));
    INITIAL_DISEASE_SCANS.forEach(s => this.scans.set(s.id, { ...s }));
    INITIAL_YIELD_PREDICTIONS.forEach(y => this.yieldPredictions.set(y.id, { ...y }));
    INITIAL_REGIONAL_ALERTS.forEach(a => this.alerts.set(a.id, { ...a }));
    this.adminLogs = [...INITIAL_ADMIN_LOGS];
  }
}

// Global declaration to survive Next.js HMR in development
const globalForStore = globalThis as unknown as { krishiStore?: Store };
export const dbStore = globalForStore.krishiStore || new Store();
if (process.env.NODE_ENV !== 'production') globalForStore.krishiStore = dbStore;

// Database helper functions
export async function getUsers(): Promise<UserProfile[]> {
  return Array.from(dbStore.users.values());
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  return dbStore.users.get(id) || null;
}

export async function getUserByPhone(phone: string): Promise<UserProfile | null> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  for (const user of Array.from(dbStore.users.values())) {
    if (user.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone) {
      return user;
    }
  }
  return null;
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  dbStore.users.set(user.id, user);
  return user;
}

export async function updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const existing = dbStore.users.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  dbStore.users.set(id, updated);
  return updated;
}

export async function getScans(farmerId?: string): Promise<DiseaseDiagnosis[]> {
  const all = Array.from(dbStore.scans.values());
  if (!farmerId) return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all.filter(s => s.farmerId === farmerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getScanById(id: string): Promise<DiseaseDiagnosis | null> {
  return dbStore.scans.get(id) || null;
}

export async function saveScan(scan: DiseaseDiagnosis): Promise<DiseaseDiagnosis> {
  dbStore.scans.set(scan.id, scan);
  return scan;
}

export async function updateScan(id: string, updates: Partial<DiseaseDiagnosis>): Promise<DiseaseDiagnosis | null> {
  const existing = dbStore.scans.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  dbStore.scans.set(id, updated);
  return updated;
}

export async function getYieldPredictions(farmerId?: string): Promise<YieldPredictionResult[]> {
  const all = Array.from(dbStore.yieldPredictions.values());
  if (!farmerId) return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all.filter(y => y.farmerId === farmerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveYieldPrediction(prediction: YieldPredictionResult): Promise<YieldPredictionResult> {
  dbStore.yieldPredictions.set(prediction.id, prediction);
  return prediction;
}

export async function getKvkCenters(state?: string, district?: string): Promise<KvkCenter[]> {
  let list = Array.from(dbStore.kvkCenters.values());
  if (state) {
    list = list.filter(k => k.state.toLowerCase() === state.toLowerCase());
  }
  if (district) {
    list = list.filter(k => k.district.toLowerCase() === district.toLowerCase());
  }
  return list;
}

export async function saveKvkCenter(center: KvkCenter): Promise<KvkCenter> {
  dbStore.kvkCenters.set(center.id, center);
  return center;
}

export async function deleteKvkCenter(id: string): Promise<boolean> {
  return dbStore.kvkCenters.delete(id);
}

export async function getRegionalAlerts(state?: string, district?: string): Promise<RegionalAlert[]> {
  let list = Array.from(dbStore.alerts.values());
  if (state) {
    list = list.filter(a => a.state.toLowerCase() === state.toLowerCase() || a.state === 'All');
  }
  return list.sort((a, b) => new Date(b.broadcastDate).getTime() - new Date(a.broadcastDate).getTime());
}

export async function saveRegionalAlert(alert: RegionalAlert): Promise<RegionalAlert> {
  dbStore.alerts.set(alert.id, alert);
  return alert;
}

export async function getAdminLogs(): Promise<AdminActivityLog[]> {
  return [...dbStore.adminLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addAdminLog(log: AdminActivityLog): Promise<AdminActivityLog> {
  dbStore.adminLogs.unshift(log);
  return log;
}
