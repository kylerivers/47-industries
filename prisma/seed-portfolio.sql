-- Portfolio Projects for 47 Industries
-- Real projects + sample projects across all service categories

-- Clear existing projects
DELETE FROM ServiceProject;

-- ============================================
-- REAL PROJECTS
-- ============================================

-- MotoRev - iOS App (FEATURED - flagship product)
INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, liveUrl, createdAt, updatedAt)
VALUES (
  UUID(),
  'MotoRev',
  'motorev',
  'IOS_APP',
  'MotoRev (47 Industries Subsidiary)',
  'MotoRev is a comprehensive motorcycle companion app designed for riders who want to track their rides, connect with other enthusiasts, and manage their garage. Built as a flagship product of 47 Industries, MotoRev combines GPS tracking, social features, and safety tools into one powerful platform.',
  'Motorcycle enthusiasts lacked a dedicated platform that combined ride tracking, social connectivity, and garage management. Existing solutions were fragmented, forcing riders to use multiple apps for different needs.',
  'We built MotoRev from the ground up as a native iOS application with a focus on performance and user experience. The app features real-time GPS tracking, social ride sharing, detailed garage management, and emergency safety features. A custom backend handles millions of data points while maintaining fast response times.',
  'MotoRev launched on the App Store with strong user engagement. The app processes thousands of ride logs monthly and has built an active community of motorcycle enthusiasts.',
  '["Swift", "SwiftUI", "MapKit", "CoreLocation", "Node.js", "PostgreSQL", "AWS", "Firebase"]',
  1, 1, 1,
  'https://motorevapp.com',
  NOW(), NOW()
);

-- Critter Captures - Web Development
INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Critter Captures',
  'critter-captures',
  'WEB_DEVELOPMENT',
  'Critter Captures Wildlife Control',
  'A professional website for a local wildlife control and extermination company. The site showcases their services, service areas, and provides easy contact options for customers dealing with unwanted critters.',
  'The client needed a professional online presence to compete with larger pest control companies. They wanted to highlight their humane capture methods and local expertise while making it easy for customers to request service.',
  'We designed and developed a clean, professional website that emphasizes trust and expertise. The site features service area maps, detailed service descriptions, an emergency contact system, and lead capture forms optimized for conversion.',
  'The new website significantly improved the client''s online visibility and lead generation, helping them compete effectively in their local market.',
  '["Next.js", "React", "Tailwind CSS", "Vercel"]',
  0, 1, 2,
  NOW(), NOW()
);

-- Lockline Bets - Web Development (In Progress)
INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Lockline Bets',
  'lockline-bets',
  'WEB_DEVELOPMENT',
  'Lockline Bets',
  'A comprehensive sports betting insights platform where subscribers can follow expert picks, track betting history, and access premium analysis. The platform includes a full admin backend for content management and a customer portal for subscribers.',
  'The client needed a platform to share betting picks and analysis with subscribers while managing subscriptions and tracking performance. The system needed to be scalable for future mobile app expansion.',
  'We''re building a complete platform with a powerful admin dashboard for managing picks, users, and analytics. The customer-facing portal provides real-time pick notifications, historical performance tracking, and subscription management. The architecture is designed for future iOS and Android apps.',
  'Currently in active development. The platform is being built with scalability in mind for future mobile expansion to iOS, Android, and cross-platform apps.',
  '["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Stripe", "Tailwind CSS"]',
  1, 1, 3,
  NOW(), NOW()
);

-- Reflux Labs - Web Development
INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Reflux Labs',
  'reflux-labs',
  'WEB_DEVELOPMENT',
  'Reflux Labs (Internal)',
  'Reflux Labs served as our R&D playground before 47 Industries expanded into services. We built 10 different sample websites and applications spanning various industries including restaurants, retail stores, smoke shops, and more.',
  'We needed to develop and refine our web development capabilities across different industries and use cases before offering services commercially.',
  'Through Reflux Labs, we created production-ready templates and components for restaurants, e-commerce stores, smoke shops, service businesses, and more. Each project helped us refine our development process and build a library of reusable solutions.',
  'The work done under Reflux Labs directly informed the service offerings at 47 Industries and gave us hands-on experience across multiple industries.',
  '["React", "Next.js", "Node.js", "MongoDB", "Tailwind CSS", "Stripe"]',
  0, 1, 4,
  NOW(), NOW()
);

-- Smoke Shop E-Commerce - Web Development
INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Smoke Shop POS & E-Commerce',
  'smoke-shop-ecommerce',
  'WEB_DEVELOPMENT',
  'Internal Development Project',
  'A comprehensive e-commerce and point-of-sale system built specifically for smoke shops and vape stores. The platform combines online ordering with in-store POS functionality for seamless inventory management.',
  'Smoke shops need specialized e-commerce solutions that handle age verification, complex inventory with multiple product variants, and integration between online and in-store sales.',
  'We built a full-featured platform with age verification, detailed product management for items with multiple sizes and variants, integrated POS for in-store transactions, and unified inventory tracking across all sales channels.',
  'The system was fully functional and ready for market deployment. It demonstrated our capability to build complex, industry-specific e-commerce solutions.',
  '["Next.js", "React", "Node.js", "PostgreSQL", "Stripe", "Square POS API", "Tailwind CSS"]',
  0, 1, 5,
  NOW(), NOW()
);

-- ============================================
-- SAMPLE PROJECTS - iOS App
-- ============================================

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'FitTrack Pro',
  'fittrack-pro',
  'IOS_APP',
  'FitTrack Health',
  'A fitness tracking application that helps users monitor workouts, nutrition, and progress toward their health goals. Features include workout planning, calorie tracking, and integration with Apple Health.',
  'Users wanted a single app that could track both workouts and nutrition without needing multiple subscriptions or complicated setups.',
  'We developed a native iOS app with intuitive workout logging, a comprehensive food database, progress photos, and seamless Apple Health integration. The app uses on-device ML for exercise recognition.',
  'The app achieved strong ratings on the App Store with users praising its simplicity and comprehensive feature set.',
  '["Swift", "SwiftUI", "HealthKit", "CoreML", "CloudKit"]',
  0, 1, 10,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'PropertySnap',
  'propertysnap',
  'IOS_APP',
  'RealEstate Solutions Inc.',
  'A real estate photography and listing app that helps agents capture, edit, and publish property photos directly from their iPhone with professional results.',
  'Real estate agents needed a faster way to capture and publish property photos without expensive equipment or desktop editing software.',
  'We built an app with guided photo capture using AR overlays, automatic image enhancement, virtual staging capabilities, and direct MLS integration for instant publishing.',
  'Agents reported 60% time savings in their listing workflow, with photo quality matching professional photographers.',
  '["Swift", "ARKit", "Core Image", "Vision", "Firebase"]',
  0, 1, 11,
  NOW(), NOW()
);

-- ============================================
-- SAMPLE PROJECTS - Android App
-- ============================================

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'FleetTracker',
  'fleettracker',
  'ANDROID_APP',
  'Metro Logistics Co.',
  'A fleet management application for delivery companies to track vehicles, optimize routes, and manage drivers in real-time. Built specifically for Android tablets mounted in delivery vehicles.',
  'The logistics company needed real-time visibility into their fleet of 200+ vehicles with route optimization and driver communication.',
  'We developed a robust Android app optimized for in-vehicle tablet use with offline capability, real-time GPS tracking, turn-by-turn navigation, proof-of-delivery capture, and driver messaging.',
  'The company reduced fuel costs by 15% through optimized routing and improved on-time delivery rates significantly.',
  '["Kotlin", "Jetpack Compose", "Google Maps SDK", "Room Database", "WorkManager"]',
  0, 1, 20,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'FieldService Pro',
  'fieldservice-pro',
  'ANDROID_APP',
  'ServiceMaster HVAC',
  'A field service management app for HVAC technicians to manage appointments, access equipment manuals, process payments, and capture customer signatures on Android devices.',
  'Technicians were using paper forms and making trips back to the office to process paperwork, wasting hours each day.',
  'We created an Android app with offline-first architecture, digital work orders, integrated payment processing, equipment databases with troubleshooting guides, and automated invoice generation.',
  'Technicians saved an average of 2 hours per day on administrative tasks, and the company eliminated paper-based processes entirely.',
  '["Kotlin", "Android SDK", "SQLite", "Stripe SDK", "CameraX"]',
  0, 1, 21,
  NOW(), NOW()
);

-- ============================================
-- SAMPLE PROJECTS - Cross-Platform App
-- ============================================

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'EventHub',
  'eventhub',
  'CROSS_PLATFORM_APP',
  'EventHub Entertainment',
  'A cross-platform event discovery and ticketing app that helps users find local events, purchase tickets, and connect with other attendees. Available on both iOS and Android from a single codebase.',
  'The client needed to launch on both platforms simultaneously with a limited budget while maintaining native-like performance and user experience.',
  'Using React Native, we built a performant cross-platform app with event discovery, secure ticket purchasing, QR code tickets, social features, and real-time event updates. A single team maintained both platforms.',
  'The app launched on both platforms within 4 months, with users unable to distinguish it from native apps. Development costs were reduced by 40% compared to building two native apps.',
  '["React Native", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "Firebase"]',
  1, 1, 30,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'StudyBuddy',
  'studybuddy',
  'CROSS_PLATFORM_APP',
  'EduTech Innovations',
  'An educational platform connecting students for study groups, tutoring sessions, and collaborative learning. Features video chat, shared whiteboards, and scheduling tools.',
  'Students needed a platform to find study partners and tutors that worked seamlessly across their various devices - phones, tablets, and computers.',
  'We developed a React Native app with WebRTC video calling, real-time collaborative whiteboards, smart matching algorithms, integrated scheduling, and in-app payments for tutoring sessions.',
  'The platform grew to thousands of active users within the first semester, with students reporting improved grades and study habits.',
  '["React Native", "WebRTC", "Socket.io", "Node.js", "MongoDB", "Stripe"]',
  0, 1, 31,
  NOW(), NOW()
);

-- ============================================
-- SAMPLE PROJECTS - Desktop App
-- ============================================

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'InvoiceMaster',
  'invoicemaster',
  'DESKTOP_APP',
  'AccountingPro Solutions',
  'A cross-platform desktop invoicing application for small businesses. Features include invoice creation, expense tracking, client management, and financial reporting with cloud sync.',
  'Small business owners needed affordable invoicing software that worked offline but could sync across multiple devices without expensive subscriptions.',
  'We built an Electron-based desktop app with a one-time purchase model. Features include professional invoice templates, recurring billing, expense categorization, profit/loss reports, and optional cloud sync.',
  'The app became a popular alternative to subscription-based solutions, with users praising the offline capability and one-time pricing.',
  '["Electron", "React", "SQLite", "Node.js", "AWS S3"]',
  0, 1, 40,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'MediaConverter Pro',
  'mediaconverter-pro',
  'DESKTOP_APP',
  'Creative Tools LLC',
  'A powerful media conversion tool for Windows and macOS that handles video, audio, and image format conversions with batch processing capabilities.',
  'Content creators needed a fast, reliable tool for converting media files without uploading to cloud services or dealing with file size limits.',
  'We developed a native-feeling desktop app using Tauri (Rust + React) for maximum performance. Features include drag-and-drop batch conversion, format presets, quality optimization, and hardware acceleration.',
  'The app processes files 3x faster than web-based alternatives and has become a favorite among video editors and podcasters.',
  '["Tauri", "Rust", "React", "FFmpeg", "TypeScript"]',
  0, 1, 41,
  NOW(), NOW()
);

-- ============================================
-- MORE WEB DEVELOPMENT SAMPLES
-- ============================================

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Bella Vista Restaurant',
  'bella-vista-restaurant',
  'WEB_DEVELOPMENT',
  'Bella Vista Italian Kitchen',
  'A modern restaurant website with online reservations, menu management, and integration with popular delivery platforms. The site showcases the restaurant''s ambiance and cuisine.',
  'The restaurant needed an online presence that captured their upscale atmosphere while making reservations and ordering seamless for customers.',
  'We created an elegant website with high-quality imagery, an interactive menu with dietary filters, OpenTable integration for reservations, and a custom admin panel for daily specials and events.',
  'Online reservations increased by 150%, and the website became the primary channel for private event inquiries.',
  '["Next.js", "React", "Tailwind CSS", "Sanity CMS", "OpenTable API"]',
  0, 1, 6,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Summit Legal Group',
  'summit-legal',
  'WEB_DEVELOPMENT',
  'Summit Legal Group LLP',
  'A professional law firm website designed to establish credibility and generate leads. Features attorney profiles, practice area pages, and secure client intake forms.',
  'The law firm needed a website that conveyed professionalism and expertise while making it easy for potential clients to understand their services and get in touch.',
  'We designed a sophisticated, trust-building website with detailed attorney bios, comprehensive practice area content, client testimonials, and HIPAA-compliant intake forms with encrypted submission.',
  'The new website contributed to a significant increase in qualified consultation requests within the first quarter.',
  '["Next.js", "React", "Tailwind CSS", "Formspree", "Vercel"]',
  0, 1, 7,
  NOW(), NOW()
);

INSERT INTO ServiceProject (id, title, slug, category, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'AutoCare Express',
  'autocare-express',
  'WEB_DEVELOPMENT',
  'AutoCare Express',
  'A multi-location auto service website with online appointment booking, service pricing, and customer account management. Supports multiple shop locations with individual scheduling.',
  'The auto shop chain needed a unified online presence for all locations while allowing customers to book appointments at their preferred location.',
  'We built a location-aware website that detects the user''s nearest shop, displays location-specific pricing and availability, and allows online booking with service advisor selection and appointment reminders.',
  'Online bookings now account for 40% of all appointments, reducing phone call volume and improving customer convenience.',
  '["Next.js", "React", "PostgreSQL", "Prisma", "Twilio", "Google Maps API"]',
  0, 1, 8,
  NOW(), NOW()
);
