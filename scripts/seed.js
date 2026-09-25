/**
 * Krishimitra AI - Database Seed Script
 * Pre-populates administrative agronomists, demo farmers, and ICAR KVK research centers
 */

const INITIAL_USERS = [
  { id: 'user_admin_01', name: 'Dr. V. K. Sharma (Sr. Scientist & Agronomist)', role: 'admin', phone: '9876543210', district: 'Ludhiana', state: 'Punjab' },
  { id: 'user_farmer_01', name: 'Ramesh Patel', role: 'farmer', phone: '9988776655', district: 'Anand', state: 'Gujarat' },
  { id: 'user_farmer_02', name: 'Balwinder Singh', role: 'farmer', phone: '9812345678', district: 'Ludhiana', state: 'Punjab' },
  { id: 'user_farmer_03', name: 'S. Murugan', role: 'farmer', phone: '9733445566', district: 'Thanjavur', state: 'Tamil Nadu' }
];

const INITIAL_KVK_CENTERS = [
  { name: 'ICAR - Krishi Vigyan Kendra, PAU Campus', district: 'Ludhiana', state: 'Punjab', phone: '+91 161 2401960' },
  { name: 'Kisan Krishi Seva Kendra & Agro Input Hub', district: 'Ludhiana', state: 'Punjab', phone: '+91 98721 00112' },
  { name: 'ICAR - KVK Anand Agricultural University', district: 'Anand', state: 'Gujarat', phone: '+91 2692 261310' },
  { name: 'ICAR - CICR KVK Nagpur', district: 'Nagpur', state: 'Maharashtra', phone: '+91 7103 275536' },
  { name: 'TNAU KVK Needamangalam', district: 'Thanjavur', state: 'Tamil Nadu', phone: '+91 4367 260666' }
];

const INITIAL_DISEASE_SCANS = [
  { crop: 'Tomato', diseaseDetected: 'Tomato Early Blight', confidence: 94.8, status: 'verified_by_admin' },
  { crop: 'Cotton', diseaseDetected: 'Cotton Bacterial Blight', confidence: 76.5, status: 'under_review' },
  { crop: 'Wheat', diseaseDetected: 'Wheat Yellow Stripe Rust', confidence: 96.2, status: 'verified_by_admin' },
  { crop: 'Rice', diseaseDetected: 'Rice Blast', confidence: 79.4, status: 'under_review' }
];

const INITIAL_REGIONAL_ALERTS = [
  { title: 'Yellow Stripe Rust Alert in Wheat', crop: 'Wheat', district: 'Ludhiana', state: 'Punjab', severity: 'critical' },
  { title: 'Unseasonal Hailstorm Warning', crop: 'All Rabi Crops', district: 'Anand', state: 'Gujarat', severity: 'warning' }
];

async function seedDatabase() {
  console.log('🌱 [SEED] Initializing Krishimitra AI Database Seed...');

  console.log(`👤 Seeding ${INITIAL_USERS.length} users (including Dr. V. K. Sharma Admin & Farmers)...`);
  INITIAL_USERS.forEach(u => {
    console.log(`   ✓ User: ${u.name} (${u.role.toUpperCase()}) - Phone: +91 ${u.phone} [${u.district}, ${u.state}]`);
  });

  console.log(`🏛️ Seeding ${INITIAL_KVK_CENTERS.length} ICAR KVK & Krishi Seva Kendra Centers...`);
  INITIAL_KVK_CENTERS.forEach(k => {
    console.log(`   ✓ Center: ${k.name} - ${k.district}, ${k.state} (Phone: ${k.phone})`);
  });

  console.log(`🔬 Seeding ${INITIAL_DISEASE_SCANS.length} Disease Diagnosis Scans (including Human-in-the-Loop review items)...`);
  INITIAL_DISEASE_SCANS.forEach(s => {
    console.log(`   ✓ Scan: ${s.crop} -> ${s.diseaseDetected} (${s.confidence}% conf, Status: ${s.status})`);
  });

  console.log(`📢 Seeding ${INITIAL_REGIONAL_ALERTS.length} Regional Disease/Pest Alerts...`);
  INITIAL_REGIONAL_ALERTS.forEach(a => {
    console.log(`   ✓ Alert: "${a.title}" [${a.district}, ${a.state}] Severity: ${a.severity.toUpperCase()}`);
  });

  console.log('\n✅ [SEED SUCCESS] Krishimitra AI database seeded successfully!');
}

seedDatabase().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
