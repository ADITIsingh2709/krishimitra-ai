-- Krishimitra AI - Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/tkoyhfrclethvlkbflai/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farmers / Users Table
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    language VARCHAR(10) DEFAULT 'hi',
    state VARCHAR(50),
    district VARCHAR(50),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    primary_crops TEXT[] DEFAULT ARRAY['Wheat', 'Rice'],
    land_size_acres NUMERIC(6, 2) DEFAULT 2.5,
    soil_type VARCHAR(50) DEFAULT 'Alluvial',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disease Scans Table
CREATE TABLE IF NOT EXISTS public.disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    crop VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    disease_detected VARCHAR(120) NOT NULL,
    scientific_name VARCHAR(120),
    confidence NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
    recommendation TEXT,
    chemical_treatment TEXT,
    dosage TEXT,
    timing TEXT,
    organic_alternative TEXT,
    prevention_tips TEXT[],
    status VARCHAR(30) DEFAULT 'diagnosed' CHECK (status IN ('diagnosed', 'under_review', 'verified_by_admin', 'corrected_by_admin')),
    admin_notes TEXT,
    corrected_disease VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Yield Predictions Table
CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    crop VARCHAR(50) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    nitrogen NUMERIC(6, 2),
    phosphorus NUMERIC(6, 2),
    potassium NUMERIC(6, 2),
    ph NUMERIC(4, 2),
    area_acres NUMERIC(6, 2) NOT NULL,
    rainfall_mm NUMERIC(6, 2),
    temperature_c NUMERIC(4, 1),
    irrigation_type VARCHAR(50) DEFAULT 'Tube Well',
    predicted_yield_per_acre_quintals NUMERIC(6, 2) NOT NULL,
    total_predicted_yield_quintals NUMERIC(8, 2) NOT NULL,
    confidence_score NUMERIC(5, 2),
    district_benchmark_quintals NUMERIC(6, 2),
    yield_delta_percentage NUMERIC(5, 2),
    actionable_tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. KVK / Krishi Seva Kendra Centers Table
CREATE TABLE IF NOT EXISTS public.kvk_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) DEFAULT 'KVK' CHECK (type IN ('KVK', 'Krishi Seva Kendra')),
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    contact_person VARCHAR(100),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    services TEXT[] DEFAULT ARRAY['Soil & Water Testing', 'Seed Distribution', 'Agronomist Advisory'],
    operational_hours VARCHAR(100) DEFAULT 'Mon - Sat: 9:00 AM - 5:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Regional Alerts Table
CREATE TABLE IF NOT EXISTS public.regional_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    crop VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'high' CHECK (severity IN ('warning', 'high', 'critical')),
    message TEXT NOT NULL,
    action_required TEXT NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    broadcast_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Admin Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(50) NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kvk_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to KVK Centers and Regional Alerts
CREATE POLICY "Public KVK Read" ON public.kvk_centers FOR SELECT USING (true);
CREATE POLICY "Public Alerts Read" ON public.regional_alerts FOR SELECT USING (true);
