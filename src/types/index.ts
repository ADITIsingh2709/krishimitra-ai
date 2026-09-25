export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'pa' | 'ta' | 'te';

export type UserRole = 'farmer' | 'admin';

export type SoilType = 
  | 'Alluvial'
  | 'Black'
  | 'Red & Yellow'
  | 'Laterite'
  | 'Arid / Desert'
  | 'Saline & Alkaline'
  | 'Clayey Loam';

export interface UserLocation {
  state: string;
  district: string;
  lat?: number;
  lng?: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  language: SupportedLanguage;
  location?: UserLocation;
  primaryCrops: string[];
  landSizeAcres: number;
  soilType: SoilType;
  notificationsEnabled?: boolean;
  createdAt: string;
}

export interface DiseaseDiagnosis {
  id: string;
  farmerId: string;
  crop: string;
  imageUrl: string;
  diseaseDetected: string;
  scientificName: string;
  confidence: number; // 0 - 100
  severity: 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
  organicAlternative: string;
  chemicalTreatment: string;
  dosage: string;
  timing: string;
  preventionTips: string[];
  status: 'diagnosed' | 'under_review' | 'verified_by_admin' | 'corrected_by_admin';
  adminNotes?: string;
  correctedDisease?: string;
  createdAt: string;
}

export interface YieldPredictionResult {
  id: string;
  farmerId: string;
  crop: string;
  soilType: SoilType;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  areaAcres: number;
  rainfallMm: number;
  temperatureC: number;
  irrigationType: 'Rainfed' | 'Canal' | 'Tube Well' | 'Drip/Sprinkler';
  predictedYieldPerAcreQuintals: number;
  totalPredictedYieldQuintals: number;
  confidenceScore: number;
  districtBenchmarkQuintals: number;
  yieldDeltaPercentage: number;
  actionableTips: string[];
  createdAt: string;
}

export interface WeatherData {
  city: string;
  district: string;
  state: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKmh: number;
  condition: string;
  conditionIcon: string;
  rainfallProbability: number;
  alerts?: {
    severity: 'info' | 'warning' | 'severe';
    title: string;
    description: string;
    actionAdvice: string;
  }[];
  forecast: {
    day: string;
    date: string;
    tempMinC: number;
    tempMaxC: number;
    condition: string;
    conditionIcon: string;
    rainMm: number;
    agriAdvice: string;
  }[];
}

export interface KvkCenter {
  id: string;
  name: string;
  type: 'KVK' | 'Krishi Seva Kendra';
  state: string;
  district: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson: string;
  latitude: number;
  longitude: number;
  services: string[];
  distanceKm?: number;
  operationalHours?: string;
}

export interface RegionalAlert {
  id: string;
  title: string;
  crop: string;
  state: string;
  district: string;
  severity: 'warning' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  broadcastDate: string;
  adminName: string;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'DIAGNOSIS_VERIFIED' | 'DIAGNOSIS_CORRECTED' | 'ALERT_PUBLISHED' | 'KVK_UPDATED' | 'KVK_ADDED' | 'KVK_DELETED';
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    name?: string;
    toolName?: string;
    args: Record<string, any>;
    result?: any;
  }[];
}
