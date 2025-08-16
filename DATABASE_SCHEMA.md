# Database Schema Design - Brickly

## Overview

This document outlines the complete database schema for the Brickly real estate platform, designed specifically for the German market with inspiration from Immobilienscout24.

## Core Tables

### 1. Users Table

```typescript
users: pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 500 }),
  role: enum('role', ['owner', 'buyer', 'admin']).default('buyer'),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // Profile information
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  country: varchar('country', { length: 50 }).default('Germany'),

  // Verification status
  isVerified: boolean('is_verified').default(false),
  verificationDate: timestamp('verification_date'),
})
```

### 2. Properties Table

```typescript
properties: pgTable('properties', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => users.id),

  // Basic information
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),

  // Property type and category
  propertyType: enum('property_type', [
    'apartment',
    'house',
    'townhouse',
    'penthouse',
    'villa',
    'duplex',
    'studio',
    'loft'
  ]).notNull(),

  propertyCategory: enum('property_category', [
    'buy',
    'rent'
  ]).default('buy'),

  // Status management
  status: enum('status', [
    'draft',
    'published',
    'live',
    'in_negotiation',
    'sold',
    'removed',
    'archived'
  ]).default('draft'),

  // Pricing
  price: decimal('price', { precision: 12, scale: 2 }),
  priceType: enum('price_type', [
    'asking_price',
    'negotiable',
    'auction',
    'by_negotiation'
  ]).default('asking_price'),

  // Size and rooms
  livingArea: integer('living_area'), // in square meters
  totalArea: integer('total_area'), // in square meters
  rooms: integer('rooms'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),

  // Construction and condition
  constructionYear: integer('construction_year'),
  condition: enum('condition', [
    'new',
    'excellent',
    'good',
    'fair',
    'needs_renovation'
  ]),

  // Energy efficiency (German standards)
  energyClass: enum('energy_class', [
    'A+',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H'
  ]),
  energyConsumption: integer('energy_consumption'), // kWh/m²/year

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
  soldAt: timestamp('sold_at'),
})
```

### 3. Property Locations Table

```typescript
propertyLocations: pgTable('property_locations', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id').references(() => properties.id),

	// Address
	street: varchar('street', { length: 255 }),
	houseNumber: varchar('house_number', { length: 10 }),
	postalCode: varchar('postal_code', { length: 10 }),
	city: varchar('city', { length: 100 }),
	district: varchar('district', { length: 100 }),
	state: varchar('state', { length: 100 }),
	country: varchar('country', { length: 50 }).default('Germany'),

	// Geographic coordinates
	latitude: decimal('latitude', { precision: 10, scale: 8 }),
	longitude: decimal('longitude', { precision: 11, scale: 8 }),

	// Floor information
	floor: integer('floor'),
	totalFloors: integer('total_floors'),

	// Additional location details
	neighborhood: varchar('neighborhood', { length: 255 }),
	landmarks: text('landmarks')
});
```

### 4. Property Media Table

```typescript
propertyMedia: pgTable('property_media', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id),

  // Media information
  type: enum('type', ['image', 'video', 'document', 'floorplan']),
  url: varchar('url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  altText: varchar('alt_text', { length: 255 }),

  // Media metadata
  filename: varchar('filename', { length: 255 }),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'), // for videos, in seconds

  // Ordering and display
  isHero: boolean('is_hero').default(false),
  sortOrder: integer('sort_order').default(0),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
})
```

### 5. Amenities Table

```typescript
amenities: pgTable('amenities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: enum('category', [
    'general',
    'kitchen',
    'bathroom',
    'outdoor',
    'security',
    'technology',
    'accessibility'
  ]).notNull(),
  icon: varchar('icon', { length: 50 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
})
```

### 6. Property Amenities Table (Junction)

```typescript
propertyAmenities: pgTable('property_amenities', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id').references(() => properties.id),
	amenityId: integer('amenity_id').references(() => amenities.id),
	value: varchar('value', { length: 255 }), // for amenities with values (e.g., "2" for parking spaces)
	notes: text('notes')
});
```

### 7. Proximity Table (Germany-specific)

```typescript
proximities: pgTable('proximities', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id').references(() => properties.id),

	// Transportation
	distanceToPublicTransport: integer('distance_to_public_transport'), // meters
	distanceToTrainStation: integer('distance_to_train_station'), // meters
	distanceToBusStop: integer('distance_to_bus_stop'), // meters
	distanceToSubway: integer('distance_to_subway'), // meters

	// Education
	distanceToPrimarySchool: integer('distance_to_primary_school'), // meters
	distanceToSecondarySchool: integer('distance_to_secondary_school'), // meters
	distanceToUniversity: integer('distance_to_university'), // meters
	distanceToKindergarten: integer('distance_to_kindergarten'), // meters

	// Shopping and services
	distanceToSupermarket: integer('distance_to_supermarket'), // meters
	distanceToShoppingCenter: integer('distance_to_shopping_center'), // meters
	distanceToPharmacy: integer('distance_to_pharmacy'), // meters
	distanceToBank: integer('distance_to_bank'), // meters

	// Healthcare
	distanceToHospital: integer('distance_to_hospital'), // meters
	distanceToDoctor: integer('distance_to_doctor'), // meters
	distanceToDentist: integer('distance_to_dentist'), // meters

	// Recreation
	distanceToPark: integer('distance_to_park'), // meters
	distanceToGym: integer('distance_to_gym'), // meters
	distanceToRestaurant: integer('distance_to_restaurant'), // meters
	distanceToCafe: integer('distance_to_cafe'), // meters

	// Work
	distanceToCityCenter: integer('distance_to_city_center'), // meters
	distanceToAirport: integer('distance_to_airport'), // meters
	distanceToHighway: integer('distance_to_highway') // meters
});
```

### 8. Appointments Table

```typescript
appointments: pgTable('appointments', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id),
  buyerId: integer('buyer_id').references(() => users.id),
  ownerId: integer('owner_id').references(() => users.id),

  // Appointment details
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(60), // minutes
  type: enum('type', ['viewing', 'consultation', 'negotiation']).default('viewing'),

  // Status
  status: enum('status', [
    'requested',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
  ]).default('requested'),

  // Communication
  notes: text('notes'),
  buyerNotes: text('buyer_notes'),
  ownerNotes: text('owner_notes'),

  // Calendar integration
  externalCalendarId: varchar('external_calendar_id', { length: 255 }),
  externalEventId: varchar('external_event_id', { length: 255 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  cancelledAt: timestamp('cancelled_at'),
})
```

### 9. Applicant Profiles Table

```typescript
applicantProfiles: pgTable('applicant_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),

  // Personal information
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  dateOfBirth: date('date_of_birth'),
  nationality: varchar('nationality', { length: 50 }),
  maritalStatus: enum('marital_status', [
    'single',
    'married',
    'divorced',
    'widowed',
    'partnership'
  ]),

  // Employment
  employmentStatus: enum('employment_status', [
    'employed',
    'self_employed',
    'unemployed',
    'student',
    'retired'
  ]),
  employer: varchar('employer', { length: 255 }),
  jobTitle: varchar('job_title', { length: 255 }),
  monthlyIncome: decimal('monthly_income', { precision: 10, scale: 2 }),

  // Financial information
  creditScore: integer('credit_score'),
  monthlyExpenses: decimal('monthly_expenses', { precision: 10, scale: 2 }),
  savings: decimal('savings', { precision: 12, scale: 2 }),
  downPayment: decimal('down_payment', { precision: 12, scale: 2 }),

  // Vetting status
  vettingStatus: enum('vetting_status', [
    'pending',
    'in_progress',
    'approved',
    'rejected',
    'appeal_pending'
  ]).default('pending'),
  vettingScore: integer('vetting_score'),
  vettingNotes: text('vetting_notes'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  vettingCompletedAt: timestamp('vetting_completed_at'),
})
```

### 10. Vetting Rules Table

```typescript
vettingRules: pgTable('vetting_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Rule configuration
  ruleType: enum('rule_type', [
    'income_verification',
    'credit_check',
    'employment_verification',
    'document_verification',
    'custom'
  ]).notNull(),

  // Rule parameters (JSON)
  parameters: jsonb('parameters'),

  // Rule logic
  condition: text('condition'), // SQL-like condition
  weight: integer('weight').default(1),

  // Country and region specificity
  country: varchar('country', { length: 50 }).default('Germany'),
  region: varchar('region', { length: 100 }),

  // Status
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### 11. Vetting Results Table

```typescript
vettingResults: pgTable('vetting_results', {
  id: serial('id').primaryKey(),
  applicantId: integer('applicant_id').references(() => applicantProfiles.id),
  ruleId: integer('rule_id').references(() => vettingRules.id),

  // Result details
  status: enum('status', ['passed', 'failed', 'warning', 'error']),
  score: integer('score'),
  details: jsonb('details'),
  notes: text('notes'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
})
```

## Indexes and Performance

### Recommended Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Properties
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- Property Locations
CREATE INDEX idx_property_locations_property_id ON property_locations(property_id);
CREATE INDEX idx_property_locations_coordinates ON property_locations(latitude, longitude);
CREATE INDEX idx_property_locations_city ON property_locations(city);

-- Property Media
CREATE INDEX idx_property_media_property_id ON property_media(property_id);
CREATE INDEX idx_property_media_type ON property_media(type);
CREATE INDEX idx_property_media_sort_order ON property_media(sort_order);

-- Appointments
CREATE INDEX idx_appointments_property_id ON appointments(property_id);
CREATE INDEX idx_appointments_buyer_id ON appointments(buyer_id);
CREATE INDEX idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);

-- Proximities
CREATE INDEX idx_proximities_property_id ON proximities(property_id);
```

## Data Integrity Constraints

### Foreign Key Relationships

- Properties → Users (owner)
- Property Locations → Properties
- Property Media → Properties
- Property Amenities → Properties + Amenities
- Proximities → Properties
- Appointments → Properties + Users (buyer/owner)
- Applicant Profiles → Users
- Vetting Results → Applicant Profiles + Vetting Rules

### Unique Constraints

- Users: email
- Property Media: property_id + sort_order (for ordering)
- Property Amenities: property_id + amenity_id
- Appointments: property_id + buyer_id + scheduled_at (prevent double booking)

## Migration Strategy

### Phase 1: Core Tables

1. Users
2. Properties
3. Property Locations
4. Property Media

### Phase 2: Features

1. Amenities + Property Amenities
2. Proximities
3. Appointments

### Phase 3: Advanced Features

1. Applicant Profiles
2. Vetting Rules
3. Vetting Results

## Seed Data

### Default Amenities (Germany-focused)

```typescript
const defaultAmenities = [
	// General
	{ name: 'Balcony', category: 'outdoor' },
	{ name: 'Garden', category: 'outdoor' },
	{ name: 'Terrace', category: 'outdoor' },
	{ name: 'Parking', category: 'general' },
	{ name: 'Elevator', category: 'general' },
	{ name: 'Basement', category: 'general' },

	// Kitchen
	{ name: 'Fitted Kitchen', category: 'kitchen' },
	{ name: 'Dishwasher', category: 'kitchen' },
	{ name: 'Oven', category: 'kitchen' },

	// Technology
	{ name: 'High-Speed Internet', category: 'technology' },
	{ name: 'Smart Home', category: 'technology' },

	// Security
	{ name: 'Alarm System', category: 'security' },
	{ name: 'Video Intercom', category: 'security' },

	// Accessibility
	{ name: 'Wheelchair Accessible', category: 'accessibility' },
	{ name: 'Ground Floor', category: 'accessibility' }
];
```

### Default Vetting Rules (Germany)

```typescript
const defaultVettingRules = [
	{
		name: 'Income Verification',
		ruleType: 'income_verification',
		condition: 'monthly_income >= property_price * 0.003', // 3% rule
		weight: 3,
		country: 'Germany'
	},
	{
		name: 'Credit Score Check',
		ruleType: 'credit_check',
		condition: 'credit_score >= 600',
		weight: 2,
		country: 'Germany'
	},
	{
		name: 'Employment Verification',
		ruleType: 'employment_verification',
		condition: 'employment_status IN ("employed", "self_employed")',
		weight: 2,
		country: 'Germany'
	}
];
```
