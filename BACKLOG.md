# Domovae - Real Estate Application Backlog

## Context

Domovae is a real estate platform that helps property owners sell their houses or apartments. The app provides an Airbnb-style interface for property listings with appointment booking capabilities. The platform includes user authentication, property management, appointment scheduling, and applicant vetting with country-specific rules.

## Ground Rules

- **Database**: Only Drizzle ORM, no manual SQL manipulation
- **Testing**: All features must be tested (unit, integration, E2E)
- **Quality**: Build and test before commit
- **Authentication**: AuthJS with social login or email only (no username/password)
- **Focus**: Germany as the first market

---

## Epic 1: Foundation & Authentication ✅ COMPLETED

**Priority**: Critical  
**Sprint**: 1-2  
**Status**: ✅ COMPLETED

### Feature 1.1: User Authentication System ✅ COMPLETED

**Description**: Implement AuthJS with social login and email authentication

#### Tasks:

- [x] **TASK-1.1.1**: Set up AuthJS configuration ✅
  - Install and configure @auth/sveltekit
  - Set up environment variables for auth providers
  - Create auth configuration file
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: AuthJS is configured and working

- [x] **TASK-1.1.2**: Implement social login providers ✅
  - Google OAuth integration
  - GitHub OAuth integration (for developers)
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Users can login with Google/GitHub

- [x] **TASK-1.1.3**: Implement email authentication ✅
  - Email/passwordless login flow
  - Magic link generation and validation
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Users can login with email magic links

- [x] **TASK-1.1.4**: Create user profile management ✅
  - User profile page
  - Profile editing capabilities
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Users can view and edit their profiles

#### Tests:

- [x] Unit tests for auth functions ✅
- [x] Integration tests for login flows ✅
- [x] E2E tests for complete auth journey ✅

### Feature 1.2: User Database Schema ✅ COMPLETED

**Description**: Design and implement user-related database schemas

#### Tasks:

- [x] **TASK-1.2.1**: Create user schema ✅
  - User table with auth fields
  - Profile information fields
  - **Estimate**: 2 hours
  - **Acceptance Criteria**: User schema is defined and migrated

- [x] **TASK-1.2.2**: Create user roles and permissions ✅
  - Owner role (can create/manage listings)
  - Buyer role (can view listings and book appointments)
  - Admin role (can manage platform)
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Role-based access control is implemented

#### Tests:

- [x] Database schema tests ✅
- [x] Role permission tests ✅

---

## Epic 2: Property Management System ✅ COMPLETED

**Priority**: High  
**Sprint**: 2-4  
**Status**: 🚧 IN PROGRESS

### Feature 2.1: Property Database Schema ✅ COMPLETED

**Description**: Design comprehensive property schema with all required attributes

#### Tasks:

- [x] **TASK-2.1.1**: Create property schema ✅
  - Basic property information (title, description, price)
  - Property type (house, apartment, etc.)
  - Status management (draft, published, live, in_negotiation, removed, archived)
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Property schema supports all basic attributes

- [x] **TASK-2.1.2**: Create media schema ✅
  - Hero image/video support
  - Multiple image support
  - Layout files support
  - **Estimate**: 3 hours
  - **Acceptance Criteria**: Media can be associated with properties

- [x] **TASK-2.1.3**: Create location schema ✅
  - Address information
  - Geographic coordinates
  - **Estimate**: 2 hours
  - **Acceptance Criteria**: Location data is properly structured

- [x] **TASK-2.1.4**: Create amenities schema ✅
  - Amenity categories
  - Property-amenity relationships
  - **Estimate**: 3 hours
  - **Acceptance Criteria**: Amenities can be assigned to properties

- [x] **TASK-2.1.5**: Create proximity schema (Germany-specific) ✅
  - Distance to public transport
  - Distance to schools
  - Distance to shopping centers
  - Distance to hospitals
  - Distance to parks
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Proximity data follows Immobilienscout24 patterns

#### Tests:

- [x] Schema validation tests ✅
- [x] Relationship tests ✅
- [x] Data integrity tests ✅

### Feature 2.2: Property CRUD Operations

**Description**: Implement full CRUD operations for property owners

#### Tasks:

- [x] **TASK-2.2.1**: Create property creation flow ✅
  - Multi-step property creation form
  - Media upload functionality
  - Draft saving capability
  - **Estimate**: 12 hours
  - **Acceptance Criteria**: Owners can create new properties with all details

- [x] **TASK-2.2.2**: Create property editing flow ✅
  - Edit existing properties
  - Media management (add/remove/reorder)
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Owners can edit all property details

- [x] **TASK-2.2.3**: Create property status management ✅
  - Status change workflows
  - Status-based visibility rules
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Owners can manage property status

- [x] **TASK-2.2.4**: Create property deletion/archiving ✅
  - Soft delete functionality
  - Archive management
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Properties can be safely removed/archived

#### Tests:

- [x] CRUD operation tests ✅
- [ ] Media upload tests
- [x] Status workflow tests ✅
- [x] Permission tests ✅

### Feature 2.3: Property Listing Interface

**Description**: Create Airbnb-style property listing interface

#### Tasks:

- [x] **TASK-2.3.1**: Create property listing page ✅
  - Hero image/video display
  - Property details layout
  - Image gallery
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: Properties display in attractive, Airbnb-style layout

- [x] **TASK-2.3.2**: Create property search and filtering ✅
  - Search by location
  - Filter by price, type, amenities
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Users can search and filter properties

- [ ] **TASK-2.3.3**: Create property map integration
  - Interactive map showing property location
  - Proximity information display
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Map shows property location and nearby amenities

#### Tests:

- [x] UI component tests ✅
- [x] Search functionality tests ✅
- [ ] Map integration tests

---

## Epic 3: Appointment System

**Priority**: High  
**Sprint**: 4-6

### Feature 3.1: Manual Appointment Booking

**Description**: Implement manual appointment booking system

#### Tasks:

- [ ] **TASK-3.1.1**: Create appointment schema
  - Appointment table with buyer/owner relationships
  - Time slot management
  - Status tracking (requested, confirmed, cancelled, completed)
  - **Estimate**: 3 hours
  - **Acceptance Criteria**: Appointment data is properly structured

- [ ] **TASK-3.1.2**: Create appointment request flow
  - Appointment request form
  - Time slot selection
  - Request submission
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Buyers can request appointments

- [ ] **TASK-3.1.3**: Create appointment management for owners
  - View incoming requests
  - Accept/reject appointments
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Owners can manage appointment requests

- [ ] **TASK-3.1.4**: Create appointment notifications
  - Email notifications for requests
  - Status change notifications
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Users receive notifications for appointments

#### Tests:

- [ ] Appointment flow tests
- [ ] Notification tests
- [ ] Permission tests

### Feature 3.2: Calendar Integration

**Description**: Integrate calendar systems for easier slot finding

#### Tasks:

- [ ] **TASK-3.2.1**: Implement calendar API integration
  - Google Calendar integration
  - Outlook Calendar integration
  - **Estimate**: 12 hours
  - **Acceptance Criteria**: Calendar systems are integrated

- [ ] **TASK-3.2.2**: Create automated slot suggestion
  - Available time slot detection
  - Conflict resolution
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: System suggests available time slots

- [ ] **TASK-3.2.3**: Create calendar sync
  - Two-way calendar synchronization
  - Appointment creation in external calendars
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: Appointments sync with external calendars

#### Tests:

- [ ] Calendar API tests
- [ ] Slot detection tests
- [ ] Sync functionality tests

---

## Epic 4: Applicant Vetting System

**Priority**: Medium  
**Sprint**: 6-8

### Feature 4.1: Vetting Rule Engine

**Description**: Create flexible rule engine for applicant vetting

#### Tasks:

- [ ] **TASK-4.1.1**: Design rule engine architecture
  - Rule definition schema
  - Rule execution engine
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Rule engine architecture is defined

- [ ] **TASK-4.1.2**: Implement Germany-specific rules
  - Income verification rules
  - Credit check rules
  - Employment verification rules
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: German vetting rules are implemented

- [ ] **TASK-4.1.3**: Create rule configuration interface
  - Admin interface for rule management
  - Rule testing capabilities
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Admins can configure and test rules

#### Tests:

- [ ] Rule engine tests
- [ ] Rule execution tests
- [ ] Configuration interface tests

### Feature 4.2: Vetting Process

**Description**: Implement the actual vetting process for applicants

#### Tasks:

- [ ] **TASK-4.2.1**: Create applicant profile schema
  - Personal information
  - Financial information
  - Employment information
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Applicant data is properly structured

- [ ] **TASK-4.2.2**: Create vetting workflow
  - Document upload
  - Information verification
  - Vetting status tracking
  - **Estimate**: 12 hours
  - **Acceptance Criteria**: Complete vetting workflow is implemented

- [ ] **TASK-4.2.3**: Create vetting results interface
  - Vetting status display
  - Result explanation
  - Appeal process
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Users can view and understand vetting results

#### Tests:

- [ ] Vetting workflow tests
- [ ] Document upload tests
- [ ] Result display tests

---

## Epic 5: Platform Management

**Priority**: Medium  
**Sprint**: 8-10

### Feature 5.1: Admin Dashboard

**Description**: Create comprehensive admin interface

#### Tasks:

- [ ] **TASK-5.1.1**: Create admin dashboard
  - User management
  - Property moderation
  - System statistics
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: Admins can manage platform effectively

- [ ] **TASK-5.1.2**: Create moderation tools
  - Property approval workflow
  - User suspension capabilities
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Moderation tools are functional

#### Tests:

- [ ] Admin functionality tests
- [ ] Moderation workflow tests

### Feature 5.2: Analytics and Reporting

**Description**: Implement analytics and reporting capabilities

#### Tasks:

- [ ] **TASK-5.2.1**: Create analytics dashboard
  - Property view statistics
  - User engagement metrics
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Analytics data is displayed

- [ ] **TASK-5.2.2**: Create reporting system
  - Export capabilities
  - Scheduled reports
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Reports can be generated and exported

#### Tests:

- [ ] Analytics accuracy tests
- [ ] Report generation tests

---

## Epic 6: SEO & Marketing

**Priority**: High  
**Sprint**: 9-11

### Feature 6.1: SEO Optimization

**Description**: Implement comprehensive SEO features for property listings

#### Tasks:

- [ ] **TASK-6.1.1**: Implement dynamic meta tags
  - Property-specific title tags
  - Meta descriptions with property details
  - Open Graph tags for social sharing
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Each property page has optimized meta tags

- [ ] **TASK-6.1.2**: Create structured data (JSON-LD)
  - Property schema markup
  - Real estate specific structured data
  - Local business schema for agents
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Search engines can understand property data

- [ ] **TASK-6.1.3**: Implement sitemap generation
  - Dynamic XML sitemap for properties
  - Sitemap submission to search engines
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Sitemap is generated and accessible

- [ ] **TASK-6.1.4**: Create SEO-friendly URLs
  - Property slug generation
  - Location-based URL structure
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: URLs are SEO-friendly and descriptive

#### Tests:

- [ ] Meta tag validation tests
- [ ] Structured data validation tests
- [ ] Sitemap generation tests
- [ ] URL structure tests

### Feature 6.2: Content Marketing

**Description**: Implement content marketing features

#### Tasks:

- [ ] **TASK-6.2.1**: Create property blog system
  - Property market insights
  - Neighborhood guides
  - Buying/selling tips
  - **Estimate**: 12 hours
  - **Acceptance Criteria**: Blog system is functional and SEO-optimized

- [ ] **TASK-6.2.2**: Implement email marketing
  - Property alerts
  - Market updates
  - Newsletter functionality
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: Email marketing system is operational

#### Tests:

- [ ] Blog functionality tests
- [ ] Email delivery tests
- [ ] Content optimization tests

---

## Epic 7: GDPR & Privacy Compliance

**Priority**: Critical  
**Sprint**: 10-12

### Feature 7.1: GDPR Compliance Framework

**Description**: Implement comprehensive GDPR compliance features

#### Tasks:

- [ ] **TASK-7.1.1**: Create privacy policy system
  - Dynamic privacy policy generation
  - Version control for policy updates
  - Multi-language support (German/English)
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: Privacy policy is comprehensive and accessible

- [ ] **TASK-7.1.2**: Implement cookie consent management
  - Cookie banner with granular controls
  - Consent tracking and storage
  - Cookie preference center
  - **Estimate**: 10 hours
  - **Acceptance Criteria**: Cookie consent is properly managed

- [ ] **TASK-7.1.3**: Create data processing register
  - Data processing activities documentation
  - Legal basis tracking
  - Data retention policies
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: All data processing is documented

- [ ] **TASK-7.1.4**: Implement data subject rights
  - Right to access (data export)
  - Right to rectification
  - Right to erasure (deletion)
  - Right to data portability
  - **Estimate**: 12 hours
  - **Acceptance Criteria**: Users can exercise their GDPR rights

#### Tests:

- [ ] Privacy policy tests
- [ ] Cookie consent tests
- [ ] Data subject rights tests
- [ ] Compliance validation tests

### Feature 7.2: Data Protection & Security

**Description**: Implement data protection and security measures

#### Tasks:

- [ ] **TASK-7.2.1**: Implement data encryption
  - Database encryption at rest
  - Data transmission encryption (TLS)
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: All sensitive data is encrypted

- [ ] **TASK-7.2.2**: Create data retention policies
  - Automatic data deletion
  - Retention period management
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Data is automatically deleted after retention period

- [ ] **TASK-7.2.3**: Implement audit logging
  - User activity logging
  - Data access logging
  - Compliance reporting
  - **Estimate**: 8 hours
  - **Acceptance Criteria**: All data access is logged and auditable

- [ ] **TASK-7.2.4**: Create data breach notification system
  - Breach detection
  - Notification workflows
  - Regulatory reporting
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Data breaches can be detected and reported

#### Tests:

- [ ] Encryption tests
- [ ] Data retention tests
- [ ] Audit logging tests
- [ ] Security vulnerability tests

### Feature 7.3: Legal Compliance

**Description**: Implement legal compliance features for German market

#### Tasks:

- [ ] **TASK-7.3.1**: Create terms of service
  - German law compliant terms
  - Property-specific terms
  - Multi-language support
  - **Estimate**: 6 hours
  - **Acceptance Criteria**: Terms of service are legally compliant

- [ ] **TASK-7.3.2**: Implement imprint (Impressum)
  - German legal requirements
  - Contact information
  - Business registration details
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: Imprint meets German legal requirements

- [ ] **TASK-7.3.3**: Create data processing agreements
  - DPA templates for third parties
  - Vendor management
  - **Estimate**: 4 hours
  - **Acceptance Criteria**: DPAs are available for third-party services

#### Tests:

- [ ] Legal compliance tests
- [ ] Terms validation tests
- [ ] Imprint compliance tests

---

## Technical Debt & Infrastructure

### Database Migrations

- [ ] Set up proper migration system
- [ ] Create seed data for development
- [ ] Implement rollback procedures

### Testing Infrastructure

- [ ] Set up comprehensive test suite
- [ ] Implement CI/CD pipeline
- [ ] Create test data factories

### Performance Optimization

- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Add CDN for media files

### Security

- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up security headers
- [ ] Implement CSRF protection

---

## Definition of Done

- [ ] Feature is implemented according to specifications
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code is reviewed and approved
- [ ] Documentation is updated
- [ ] Feature is deployed to staging
- [ ] Feature is tested in staging environment
- [ ] Feature is deployed to production
- [ ] Feature is monitored in production

## Sprint Planning Notes

- Each sprint should be 2 weeks
- Prioritize features based on user value
- Include technical debt items in each sprint
- Regular backlog grooming sessions
- Stakeholder demos at end of each sprint
