-- Portfolio Projects for 47 Industries
-- Real projects only - Built by Reflux Labs / 47 Industries

-- Clear existing projects
DELETE FROM ServiceProject;

-- ============================================
-- FLAGSHIP PRODUCTS
-- ============================================

-- MotoRev - iOS App (FEATURED - flagship product)
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, thumbnailUrl, images, isFeatured, isActive, sortOrder, liveUrl, createdAt, updatedAt)
VALUES (
  UUID(),
  'MotoRev',
  'motorev',
  'IOS_APP',
  '["IOS_APP", "CROSS_PLATFORM_APP"]',
  'MotoRev (47 Industries Subsidiary)',
  'MotoRev is a comprehensive motorcycle companion app designed for riders who want to track their rides, connect with other enthusiasts, and manage their garage. Built as a flagship product of 47 Industries, MotoRev combines GPS tracking, social features, and safety tools into one powerful platform.',
  'Motorcycle enthusiasts lacked a dedicated platform that combined ride tracking, social connectivity, and garage management. Existing solutions were fragmented, forcing riders to use multiple apps for different needs.',
  'We built MotoRev from the ground up as a native iOS application with a focus on performance and user experience. The app features real-time GPS tracking, social ride sharing, detailed garage management, and emergency safety features. A custom backend handles millions of data points while maintaining fast response times.',
  'MotoRev launched on the App Store with strong user engagement. The app processes thousands of ride logs monthly and has built an active community of motorcycle enthusiasts.',
  '["Swift", "SwiftUI", "MapKit", "CoreLocation", "Node.js", "PostgreSQL", "AWS", "Firebase"]',
  'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598429854-cvlxeqapuqb-moto_17.png',
  '["https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598631106-4f6xn6laykr-motorev-garage.png", "https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598631535-i7jsprhrhd-motorev-profile.png", "https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598632332-vkv2a7mr2f-motorev-social.png", "https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598632738-8enyvvrsl28-motorev-navigate.png", "https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764598595234-yvpp1o3omtf-Screenshot_2025-12-01_at_9.15.45_AM.png"]',
  1, 1, 1,
  'https://motorevapp.com',
  NOW(), NOW()
);

-- Lockline Bets - Web Development
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, liveUrl, createdAt, updatedAt)
VALUES (
  UUID(),
  'Lockline Bets',
  'lockline-bets',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  'Lockline Bets',
  'A comprehensive sports betting insights platform where subscribers can follow expert picks, track betting history, and access premium analysis. The platform includes a full admin backend for content management and a customer portal for subscribers.',
  'The client needed a platform to share betting picks and analysis with subscribers while managing subscriptions and tracking performance. The system needed to be scalable for future mobile app expansion.',
  'We built a complete platform with a powerful admin dashboard for managing picks, users, and analytics. The customer-facing portal provides real-time pick notifications, historical performance tracking, and subscription management. The architecture is designed for future iOS and Android apps.',
  'The platform is live and actively serving subscribers with daily picks, comprehensive analytics, and a growing user base.',
  '["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Stripe", "Tailwind CSS"]',
  1, 1, 2,
  NULL,
  NOW(), NOW()
);

-- Reflux Labs - Internal R&D
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, thumbnailUrl, isFeatured, isActive, sortOrder, liveUrl, createdAt, updatedAt)
VALUES (
  UUID(),
  'Reflux Labs',
  'reflux-labs',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT", "IOS_APP", "ANDROID_APP"]',
  'Reflux Labs (Internal)',
  'Reflux Labs served as our R&D playground before 47 Industries expanded into services. We built multiple production-ready demo applications spanning various industries including e-commerce, restaurants, real estate, healthcare, fitness, landscaping, and more.',
  'We needed to develop and refine our web development capabilities across different industries and use cases before offering services commercially.',
  'Through Reflux Labs, we created production-ready templates and full-stack applications for diverse industries. Each project helped us refine our development process and build a library of reusable, battle-tested solutions.',
  'The work done under Reflux Labs directly informed the service offerings at 47 Industries and gave us hands-on experience across multiple industries.',
  '["React", "Next.js", "Node.js", "MongoDB", "PostgreSQL", "Tailwind CSS", "Stripe", "Bootstrap"]',
  'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/1764606459630-pedpoblbrro-refluxlabs.png',
  1, 1, 3,
  NULL,
  NOW(), NOW()
);

-- Critter Captures - Real Client Project
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Critter Captures',
  'critter-captures',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  'Critter Captures Wildlife Control',
  'A professional website for a local wildlife control and extermination company. The site showcases their services, service areas, and provides easy contact options for customers dealing with unwanted critters.',
  'The client needed a professional online presence to compete with larger pest control companies. They wanted to highlight their humane capture methods and local expertise while making it easy for customers to request service.',
  'We designed and developed a clean, professional website that emphasizes trust and expertise. The site features service area maps, detailed service descriptions, an emergency contact system, and lead capture forms optimized for conversion.',
  'The new website significantly improved the client''s online visibility and lead generation, helping them compete effectively in their local market.',
  '["Next.js", "React", "Tailwind CSS", "Vercel"]',
  0, 1, 4,
  NOW(), NOW()
);

-- ============================================
-- INTERNAL DEVELOPMENT PROJECTS
-- ============================================

-- E-commerce - ShopTech
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'ShopTech E-commerce Platform',
  'shoptech-ecommerce',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A modern e-commerce solution featuring advanced product management, secure checkout, real-time inventory tracking, and a comprehensive admin panel. Built as a premium tech store with categories for gaming, smart home, and audio products.',
  'E-commerce businesses need a complete solution that handles everything from product catalogs and shopping carts to order management and analytics.',
  'We built a full-featured e-commerce platform with product collections, advanced filtering, cart functionality, secure checkout, user accounts, wishlists, and a powerful admin dashboard for managing inventory, orders, and analytics.',
  'A production-ready e-commerce platform showcasing our capability to build scalable online stores for any industry.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "PHP", "MySQL"]',
  0, 1, 10,
  NOW(), NOW()
);

-- Restaurant Website
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Restaurant Website & Management',
  'restaurant-demo',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A complete restaurant solution featuring an elegant customer-facing website with online ordering, table reservations, menu management, and a kitchen management system through the admin panel.',
  'Restaurants need an online presence that showcases their atmosphere and cuisine while providing practical features like reservations and online ordering.',
  'We developed a full restaurant website with beautiful menu displays, online reservation system, contact integration, and an admin panel for managing menus, reservations, orders, and viewing analytics.',
  'A complete restaurant solution ready for deployment, customizable for any dining establishment from casual to fine dining.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP"]',
  0, 1, 11,
  NOW(), NOW()
);

-- Real Estate Portal
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Real Estate Portal',
  'realestate-portal',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A property listing platform with virtual tours, advanced search functionality, agent portal, and lead management system. Designed for real estate agencies and independent agents.',
  'Real estate professionals need a platform to showcase listings, capture leads, and manage client relationships effectively.',
  'We built a comprehensive real estate portal with property listings, advanced search and filtering, agent profiles, lead capture forms, and an agent dashboard for managing listings, leads, and client communications.',
  'A complete real estate solution that helps agents and agencies establish a professional online presence and generate leads.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]',
  0, 1, 12,
  NOW(), NOW()
);

-- Healthcare Portal
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Healthcare Patient Portal',
  'healthcare-portal',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A patient management system featuring appointment scheduling, medical records access, test results viewing, secure messaging with providers, and medication tracking. Includes a comprehensive staff dashboard.',
  'Healthcare providers need secure, HIPAA-compliant solutions for patient engagement that streamline appointment booking and communication.',
  'We developed a full patient portal with appointment scheduling, medical records viewing, test results, secure provider messaging, medication management, and a staff dashboard for managing patients and appointments.',
  'A healthcare solution demonstrating our ability to build secure, compliant applications for the medical industry.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]',
  0, 1, 13,
  NOW(), NOW()
);

-- Fitness Management
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Fitness & Gym Management',
  'fitness-management',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A complete gym management system featuring class scheduling, member tracking, trainer profiles, workout logging, progress tracking, and a comprehensive admin panel for gym operations.',
  'Fitness centers need an all-in-one solution for managing memberships, classes, trainers, and member progress.',
  'We built a full fitness portal with class schedules, member registration, trainer profiles, workout and progress tracking, analytics dashboard, and admin tools for managing all aspects of gym operations.',
  'A production-ready fitness management system suitable for gyms, yoga studios, CrossFit boxes, and personal training businesses.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]',
  0, 1, 14,
  NOW(), NOW()
);

-- Wells Landscaping
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Wells Landscaping Services',
  'landscaping-services',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A professional landscaping website featuring service showcase, project gallery, consultation booking, invoice generation, and a complete admin panel for managing projects, team, and client communications.',
  'Landscaping businesses need a professional online presence that showcases their work and makes it easy for customers to request quotes.',
  'We developed a complete landscaping website with service pages, project portfolio, pricing information, contact forms, and an admin panel with project management, invoicing, team management, and appointment scheduling.',
  'A full-featured solution for landscaping, lawn care, and outdoor service businesses.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "Node.js"]',
  0, 1, 15,
  NOW(), NOW()
);

-- Sunshine Smoke & Stuff
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Smoke Shop & Kava Bar',
  'smoke-shop-demo',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A complete smoke shop solution featuring product catalog, inventory management, order processing, customer management, and a unique kava bar section. Includes full admin panel with reporting and analytics.',
  'Smoke shops and vape stores need specialized e-commerce with age verification, complex inventory for product variants, and point-of-sale integration.',
  'We built Sunshine Smoke & Stuff with a modern storefront, product catalog with categories for vapes, cigars, and kava bar menu, inventory management, order processing, customer database, and comprehensive reporting.',
  'A specialized retail solution demonstrating our ability to build industry-specific e-commerce platforms.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "Node.js", "PHP", "MySQL"]',
  0, 1, 16,
  NOW(), NOW()
);

-- Education Portal
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Education & Learning Portal',
  'education-portal',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A comprehensive learning management system featuring course catalogs, virtual classrooms, assignment submissions, student progress tracking, instructor management, and discussion forums.',
  'Educational institutions and online course creators need a platform to deliver content, track student progress, and facilitate learning.',
  'We developed a full LMS with course management, virtual classroom integration, assignment submission and grading, student analytics, instructor dashboards, and discussion forums for collaborative learning.',
  'A complete education platform suitable for schools, training centers, and online course businesses.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]',
  0, 1, 17,
  NOW(), NOW()
);

-- Legal Portal
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'Legal Services Portal',
  'legal-portal',
  'WEB_DEVELOPMENT',
  '["WEB_DEVELOPMENT"]',
  '47 Industries (Internal)',
  'A professional legal services website featuring attorney profiles, practice area pages, client intake forms, document management, and an admin portal with case tracking and analytics.',
  'Law firms need a professional online presence that establishes credibility and generates qualified leads while managing client intake.',
  'We built a legal services portal with attorney bios, practice area content, secure client intake forms, document upload capabilities, and an admin dashboard for managing inquiries and tracking analytics.',
  'A professional solution for law firms and legal service providers.',
  '["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP"]',
  0, 1, 18,
  NOW(), NOW()
);

-- BookFade - SaaS Barber Booking Platform
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, liveUrl, createdAt, updatedAt)
VALUES (
  UUID(),
  'BookFade',
  'bookfade',
  'WEB_APP',
  '["WEB_APP", "WEB_DEVELOPMENT"]',
  'BookFade (47 Industries Product)',
  'BookFade is a comprehensive SaaS booking platform designed specifically for barbers and barbershops. The platform features a marketing website, admin dashboard for barbers to manage their business, and custom booking pages for each barber. Barbers can set their own services, pricing, availability, and accept bookings 24/7 with automated SMS and email notifications.',
  'Barbers and barbershops needed an affordable, professional booking solution that allows customers to book appointments online without phone calls. The platform needed to support both individual barbers and entire shops with multiple barbers, handle custom domains, integrate with calendars, and provide a seamless mobile experience.',
  'We built a multi-tenant SaaS platform with separate domains for marketing (bookfade.com) and the application (bookfade.app). Each barber gets a unique booking page (bookfade.app/slug) and can optionally use their own custom domain. The platform includes a full admin dashboard for managing services, availability, appointments, and business analytics. We integrated Stripe for subscriptions, Twilio for SMS notifications, Google Calendar sync, and built a companion mobile app for barbers. The system supports both individual barbers and shop plans with multiple barbers.',
  'BookFade successfully launched with a 14-day free trial model and tiered pricing (Barber plan at $29.99/month and Shop plan at $59.99/month). The platform features automated trial reminders, custom domain support via Cloudflare for SaaS, and comprehensive booking management with real-time availability.',
  '["Next.js 16", "TypeScript", "React", "Tailwind CSS", "Prisma", "MySQL", "NextAuth.js", "Stripe", "Twilio", "Resend", "Google Calendar API", "Cloudflare for SaaS", "Railway"]',
  1, 1, 3,
  'https://bookfade.com',
  NOW(), NOW()
);

-- InstaLeadAI - Instagram Lead Generation Platform
INSERT INTO ServiceProject (id, title, slug, category, categories, clientName, description, challenge, solution, results, technologies, isFeatured, isActive, sortOrder, createdAt, updatedAt)
VALUES (
  UUID(),
  'InstaLeadAI',
  'instaleadai',
  'IOS_APP',
  '["IOS_APP", "WEB_APP"]',
  '47 Industries (Internal Product)',
  'InstaLeadAI is a complete Instagram lead generation and management system consisting of an iOS app and Node.js backend. The platform helps businesses capture leads from Instagram, track conversations, automate follow-ups, and convert prospects into appointments. Features include lead capture, Instagram account tracking, conversation flow automation, appointment scheduling, and real-time analytics dashboard.',
  'Businesses using Instagram for lead generation struggled with manual lead tracking, follow-up management, and converting Instagram conversations into appointments. There was no integrated solution that combined lead capture, conversation tracking, and appointment scheduling in one seamless platform.',
  'We built a native iOS app with SwiftUI for the frontend and a robust Node.js/Express API backend deployed on Railway. The system uses MySQL for data persistence and features real-time synchronization between the mobile app and backend. The architecture is designed for scalability with automatic deployments via GitHub to Railway, proper database schema management, and environment-driven configuration.',
  'Successfully launched as an internal 47 Industries product for Instagram lead generation. The platform enables businesses to streamline their Instagram sales funnel with automated lead capture and conversation tracking.',
  '["Swift", "SwiftUI", "Node.js", "Express.js", "MySQL", "Railway", "RESTful API"]',
  0, 1, 4,
  NOW(), NOW()
);
