require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Category = require("../models/Category");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const Review = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");

async function seedData() {
  await connectDB();
  console.log("Connected to MongoDB for seeding...");

  // Clear existing courses, sections, lessons, reviews, categories, users
  console.log("Cleaning old course, category, and user collections...");
  await Promise.all([
    Course.deleteMany({}),
    Section.deleteMany({}),
    Lesson.deleteMany({}),
    Review.deleteMany({}),
    Category.deleteMany({}),
    Enrollment.deleteMany({}),
    Progress.deleteMany({}),
    User.deleteMany({})
  ]);

  // 1. Create users with proper bcrypt password hashing
  console.log("Seeding users...");
  const adminUser = await User.create({
    name: "Admin Superuser",
    email: "admin@coursea.com",
    password: "password123",
    role: "admin",
    headline: "Platform Administrator",
    bio: "Oversees Coursea operations, platform safety, and curriculum standards.",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
  });

  const brad = await User.create({
    name: "Brad Traversy",
    email: "brad@coursea.com",
    password: "password123",
    role: "instructor",
    headline: "Senior Full-Stack Engineer & Creator of Traversy Media",
    bio: "Teaching web development and programming for over 12 years. Focused on practical, project-based courses with modern stacks like React, Node.js, and TypeScript.",
    website: "https://traversymedia.com",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  });

  const angela = await User.create({
    name: "Dr. Angela Yu",
    email: "angela@coursea.com",
    password: "password123",
    role: "instructor",
    headline: "Lead Instructor at The App Brewery",
    bio: "Passionate educator who has taught over 2 million students worldwide to code in Python, Flutter, iOS, and Web Development.",
    website: "https://appbrewery.co",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
  });

  const max = await User.create({
    name: "Maximilian Schwarzmüller",
    email: "max@coursea.com",
    password: "password123",
    role: "instructor",
    headline: "Professional Web Developer & AWS Certified Architect",
    bio: "Self-taught developer starting at age 12. Taught 3M+ students on modern frontend, backend, Docker, Kubernetes, and Cloud.",
    website: "https://academind.com",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  });

  const student = await User.create({
    name: "John Doe",
    email: "student@coursea.com",
    password: "password123",
    role: "student",
    headline: "Aspiring Full Stack Engineer",
    bio: "Lifelong learner passionate about web technologies, AI, and building modern apps.",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
  });

  // 2. Create Categories
  console.log("Seeding categories...");
  const catWeb = await Category.create({
    name: "Web Development",
    description: "Learn modern HTML, CSS, JavaScript, React, Next.js, Node.js and full-stack development."
  });

  const catAI = await Category.create({
    name: "Data Science & AI",
    description: "Master Python, Machine Learning, Deep Learning, Pandas, and Data Visualization."
  });

  const catMobile = await Category.create({
    name: "Mobile App Development",
    description: "Build native and cross-platform apps for iOS and Android with Flutter and React Native."
  });

  const catDesign = await Category.create({
    name: "UI/UX Design",
    description: "Design stunning digital experiences, wireframes, and interactive prototypes with Figma."
  });

  const catCloud = await Category.create({
    name: "Cloud & DevOps",
    description: "Master Docker, Kubernetes, CI/CD pipelines, AWS, and modern cloud deployment architectures."
  });

  // 3. Courses Definition
  console.log("Seeding courses, sections, and lessons...");

  const coursesData = [
    {
      title: "Modern React 19 & Next.js 15: The Complete Guide",
      description: "Master modern React 19 from ground zero to production! Learn Server Actions, Hooks, Context API, Tailwind CSS, and build a full-featured Next.js 15 application with real-world authentication and deployment.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
      price: 0, // FREE COURSE!
      instructor: brad._id,
      category: catWeb._id,
      level: "beginner",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "React 19 core fundamentals & JSX syntax",
        "React Hooks: useState, useEffect, useRef, useMemo",
        "State management with Context API & Custom Hooks",
        "Next.js 15 App Router & Server Components",
        "Server Actions, Data Fetching & Caching",
        "Deploying production-ready applications to Vercel"
      ],
      requirements: [
        "Basic understanding of HTML, CSS, and modern JavaScript (ES6+)",
        "A computer (Mac, Windows, or Linux) with Node.js installed",
        "Eagerness to build real, modern web applications"
      ],
      sections: [
        {
          title: "Module 1: React 19 Fundamentals & Architecture",
          order: 1,
          lessons: [
            {
              title: "1. Welcome & What's New in React 19",
              description: "An overview of modern React, the new compiler, Actions, and how the virtual DOM works.",
              videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
              duration: 14,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Project Setup with Vite, Tailwind CSS & Lucide Icons",
              description: "Quickly bootstrap a blazing fast React project using Vite and configure utility-first Tailwind CSS.",
              videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
              duration: 20,
              order: 2,
              isPreview: true
            },
            {
              title: "3. Components, Props & Reusable UI Patterns",
              description: "Mastering functional components, passing props, destructuring, and building reusable card and button components.",
              videoUrl: "https://www.youtube.com/watch?v=s2skans2dP4",
              duration: 25,
              order: 3,
              isPreview: false
            }
          ]
        },
        {
          title: "Module 2: State, Hooks & Context API",
          order: 2,
          lessons: [
            {
              title: "4. useState & useEffect In-Depth",
              description: "Handling local component state, side effects, API fetching, and memory leak cleanup.",
              videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
              duration: 22,
              order: 1,
              isPreview: true
            },
            {
              title: "5. Global State Management with React Context API",
              description: "Creating custom providers and consuming context cleanly across deeply nested component trees.",
              videoUrl: "https://www.youtube.com/watch?v=poQXNp9ItL4",
              duration: 28,
              order: 2,
              isPreview: false
            }
          ]
        },
        {
          title: "Module 3: Next.js 15 & Full Deployment",
          order: 3,
          lessons: [
            {
              title: "6. Next.js 15 App Router & Server Components",
              description: "Understanding server vs client components, dynamic routing, and search param handling.",
              videoUrl: "https://www.youtube.com/watch?v=843nec-IvW0",
              duration: 35,
              order: 1,
              isPreview: false
            },
            {
              title: "7. Production Build Optimization & Deployment",
              description: "Running linting, production build checks, environment variables setup, and deploying live to Vercel.",
              videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
              duration: 18,
              order: 2,
              isPreview: false
            }
          ]
        }
      ]
    },
    {
      title: "Python for Data Science, AI & Machine Learning Bootcamp",
      description: "Go from complete beginner to building machine learning models in Python! Learn NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn with hands-on projects, real datasets, and data visualization exercises.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      price: 19.99,
      instructor: angela._id,
      category: catAI._id,
      level: "all",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "Python programming syntax, data structures, and functions",
        "Fast numerical operations with NumPy arrays",
        "Data wrangling, cleaning, and analysis with Pandas",
        "Beautiful visualizations with Matplotlib & Seaborn",
        "Machine Learning algorithms: Linear Regression, Logistic Regression, Decision Trees",
        "Model evaluation, cross-validation, and metrics"
      ],
      requirements: [
        "No prior programming experience required",
        "Computer with internet connection (Windows, Mac, or Linux)",
        "All free software used (Anaconda / Jupyter Notebook / VS Code)"
      ],
      sections: [
        {
          title: "Part 1: Python Fundamentals & Data Environment",
          order: 1,
          lessons: [
            {
              title: "1. Setting up Python, Jupyter Notebooks & VS Code",
              description: "Installation and configuration of Anaconda and modern interactive notebook workflows.",
              videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
              duration: 16,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Python Core Data Structures: Lists, Dicts & Sets",
              description: "Working with native Python data types, list comprehensions, and functional programming basics.",
              videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
              duration: 25,
              order: 2,
              isPreview: true
            }
          ]
        },
        {
          title: "Part 2: NumPy & Pandas for Data Analysis",
          order: 2,
          lessons: [
            {
              title: "3. NumPy Arrays & Vectorized Math",
              description: "Multidimensional arrays, slicing, indexing, broadcasting, and linear algebra operations.",
              videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
              duration: 30,
              order: 1,
              isPreview: false
            },
            {
              title: "4. Pandas DataFrames: Cleaning & Aggregating Real Data",
              description: "Importing CSV files, handling missing values, filtering rows, and groupby operations.",
              videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
              duration: 38,
              order: 2,
              isPreview: false
            }
          ]
        },
        {
          title: "Part 3: Machine Learning with Scikit-Learn",
          order: 3,
          lessons: [
            {
              title: "5. Supervised Learning: Building Your First Predictor",
              description: "Train-test splitting, fitting a model with Scikit-Learn, and evaluating precision and recall.",
              videoUrl: "https://www.youtube.com/watch?v=0Lt9w-BxKFQ",
              duration: 42,
              order: 1,
              isPreview: false
            }
          ]
        }
      ]
    },
    {
      title: "Flutter & Dart: Build Beautiful iOS and Android Apps",
      description: "Build cross-platform mobile apps for iOS and Android with a single codebase! Learn Flutter 3.24, state management with Riverpod, custom animations, responsive layouts, and backend integration.",
      thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80",
      price: 0, // FREE COURSE!
      instructor: angela._id,
      category: catMobile._id,
      level: "beginner",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "Dart programming language from scratch",
        "Flutter widget architecture & layout engine",
        "Building responsive mobile UIs for phone & tablet",
        "Navigation, routing, and passing data between screens",
        "State management best practices",
        "REST API integration and JSON serialization"
      ],
      requirements: [
        "Basic computer skills",
        "Mac required if you want to run iOS Simulator; PC or Mac works for Android & Chrome",
        "No prior mobile development experience needed"
      ],
      sections: [
        {
          title: "Module 1: Flutter & Dart Foundations",
          order: 1,
          lessons: [
            {
              title: "1. Introduction to Flutter Multi-Platform Architecture",
              description: "How Flutter renders directly to native canvas and why it delivers 60fps/120fps performance.",
              videoUrl: "https://www.youtube.com/watch?v=1rP_85mEmsQ",
              duration: 15,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Dart Language Tour: Sound Null Safety & Types",
              description: "Understanding static types, async/await, futures, and modern object-oriented Dart.",
              videoUrl: "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q",
              duration: 24,
              order: 2,
              isPreview: true
            }
          ]
        },
        {
          title: "Module 2: Building Beautiful Mobile Interfaces",
          order: 2,
          lessons: [
            {
              title: "3. Stateless vs Stateful Widgets & Layout Trees",
              description: "Row, Column, Stack, ListView, and creating responsive layouts using MediaQuery.",
              videoUrl: "https://www.youtube.com/watch?v=x0uinJvhNxI",
              duration: 32,
              order: 1,
              isPreview: false
            },
            {
              title: "4. Connecting REST APIs & Displaying Dynamic Data",
              description: "Using the http package, parsing JSON, and showing loading indicators and error states.",
              videoUrl: "https://www.youtube.com/watch?v=VPvVD8t02U8",
              duration: 36,
              order: 2,
              isPreview: false
            }
          ]
        }
      ]
    },
    {
      title: "UI/UX Design Masterclass: Figma to Interactive Prototypes",
      description: "Master modern user interface and user experience design. Learn design theory, typography, spacing, component libraries, Auto-Layout, design systems, and build high-fidelity interactive prototypes in Figma.",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      price: 14.99,
      instructor: brad._id,
      category: catDesign._id,
      level: "intermediate",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "Design principles: visual hierarchy, contrast, balance, and white space",
        "Color theory, modern typography pairings, and 8pt grid systems",
        "Figma Auto-Layout 5.0, constraints, and responsive resizing",
        "Building a scalable Design System with tokens and variants",
        "Interactive prototypes with smart animate micro-interactions",
        "Exporting specs and collaborating smoothly with developers"
      ],
      requirements: [
        "A free Figma account",
        "No prior design software experience needed",
        "A passion for clean, user-friendly digital products"
      ],
      sections: [
        {
          title: "Phase 1: UX Research & Visual Fundamentals",
          order: 1,
          lessons: [
            {
              title: "1. Design Thinking & User Journey Mapping",
              description: "How to define user personas, map out pain points, and structure wireframes.",
              videoUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
              duration: 18,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Color Palettes, Typography & 8-Point Grids",
              description: "Creating accessible color contrast and scalable typography scales in Figma.",
              videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
              duration: 25,
              order: 2,
              isPreview: true
            }
          ]
        },
        {
          title: "Phase 2: Figma Power Tools & Prototyping",
          order: 2,
          lessons: [
            {
              title: "3. Auto-Layout & Component Variants Masterclass",
              description: "Building responsive cards, navigation bars, and form inputs that adapt to screen size.",
              videoUrl: "https://www.youtube.com/watch?v=T_s_U_k5k34",
              duration: 34,
              order: 1,
              isPreview: false
            },
            {
              title: "4. Smart Animate & Micro-Interactions",
              description: "Creating delightful animations, modal transitions, and interactive mobile prototypes.",
              videoUrl: "https://www.youtube.com/watch?v=kbZq_LsmZRo",
              duration: 28,
              order: 2,
              isPreview: false
            }
          ]
        }
      ]
    },
    {
      title: "Docker, Kubernetes & AWS DevOps: Zero to Hero",
      description: "Learn how modern software is built, packaged, tested, and deployed at scale! Master Docker containers, multi-stage builds, Kubernetes pod orchestration, Helm charts, and continuous delivery with GitHub Actions on AWS.",
      thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80",
      price: 24.99,
      instructor: max._id,
      category: catCloud._id,
      level: "advanced",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "Docker containerization fundamentals and image creation",
        "Multi-stage Dockerfiles for lean production images",
        "Multi-container development environments with Docker Compose",
        "Kubernetes concepts: Pods, Deployments, Services, and Ingress",
        "Deploying microservices with automated rolling updates",
        "CI/CD automation using GitHub Actions and AWS ECR/ECS"
      ],
      requirements: [
        "Basic Linux terminal command familiarity",
        "Basic understanding of web servers and web applications",
        "Free Docker Desktop installed on your workstation"
      ],
      sections: [
        {
          title: "Section 1: Docker Deep Dive",
          order: 1,
          lessons: [
            {
              title: "1. Docker Architecture & Containerization Basics",
              description: "Virtual machines vs containers, Docker daemon, layers, and running your first container.",
              videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE",
              duration: 22,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Dockerfile Optimization & Multi-Stage Builds",
              description: "How to shrink image sizes from 1GB to 50MB using Alpine Linux and multi-stage builds.",
              videoUrl: "https://www.youtube.com/watch?v=HG6yIjZapSA",
              duration: 30,
              order: 2,
              isPreview: true
            }
          ]
        },
        {
          title: "Section 2: Kubernetes Orchestration & Deployment",
          order: 2,
          lessons: [
            {
              title: "3. Kubernetes Architecture: Pods, Deployments & Services",
              description: "Setting up Minikube or Kind and managing declarative YAML deployments.",
              videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do",
              duration: 44,
              order: 1,
              isPreview: false
            },
            {
              title: "4. Automated CI/CD Pipeline to AWS Cloud",
              description: "Automating testing, Docker builds, and deployment pushes with GitHub Actions.",
              videoUrl: "https://www.youtube.com/watch?v=R8_veQiYBjI",
              duration: 38,
              order: 2,
              isPreview: false
            }
          ]
        }
      ]
    },
    {
      title: "Full Stack MERN Architecture: Build & Deploy Real-World Apps",
      description: "Build an end-to-end e-commerce and course management platform using MongoDB, Express.js, React, and Node.js. Master JWT auth, role authorization, REST APIs, Stripe checkout, image uploads, and scalable schemas.",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      price: 29.99,
      instructor: max._id,
      category: catWeb._id,
      level: "intermediate",
      language: "English",
      published: true,
      approved: true,
      whatYouWillLearn: [
        "Full-stack MERN architectural patterns and separation of concerns",
        "Building RESTful APIs with Node.js and Express",
        "Mongoose schemas, relationships, indexing, and aggregation pipelines",
        "Secure JSON Web Token (JWT) auth with bcrypt password hashing",
        "Multer file uploads for profile avatars and thumbnails",
        "Integrating Stripe payment webhooks and checkout sessions"
      ],
      requirements: [
        "Fundamental JavaScript knowledge (functions, arrays, async/await)",
        "Basic React knowledge is helpful but explained step-by-step",
        "A code editor like VS Code installed"
      ],
      sections: [
        {
          title: "Module 1: Backend Architecture & Database Design",
          order: 1,
          lessons: [
            {
              title: "1. Node.js & Express REST API Setup",
              description: "Structuring routes, controllers, middleware, and connecting to MongoDB Atlas.",
              videoUrl: "https://www.youtube.com/watch?v=-MTSQjw5DrM",
              duration: 26,
              order: 1,
              isPreview: true
            },
            {
              title: "2. Authentication Middleware & JWT Protection",
              description: "Building secure registration, login, token signing, and role-based route guards.",
              videoUrl: "https://www.youtube.com/watch?v=7nafaH9SddU",
              duration: 32,
              order: 2,
              isPreview: true
            }
          ]
        },
        {
          title: "Module 2: Client Integration & Payment Flow",
          order: 2,
          lessons: [
            {
              title: "3. Connecting React Frontend to Backend API",
              description: "Configuring Axios/Fetch client, interceptors, and global authentication context.",
              videoUrl: "https://www.youtube.com/watch?v=w3vs4a03y3I",
              duration: 35,
              order: 1,
              isPreview: false
            },
            {
              title: "4. Integrating Stripe Checkout & Webhook Handling",
              description: "Processing payments, validating Stripe webhook signatures, and provisioning student enrollments.",
              videoUrl: "https://www.youtube.com/watch?v=1r-F3FION18",
              duration: 40,
              order: 2,
              isPreview: false
            }
          ]
        }
      ]
    }
  ];

  // Insert all courses and their sections and lessons
  for (const cData of coursesData) {
    const { sections, ...courseFields } = cData;
    const course = await Course.create(courseFields);
    console.log(`Created course: "${course.title}" ($${course.price})`);

    for (const sData of sections) {
      const { lessons, ...sectionFields } = sData;
      const section = await Section.create({
        ...sectionFields,
        course: course._id
      });

      for (const lData of lessons) {
        await Lesson.create({
          ...lData,
          section: section._id,
          course: course._id
        });
      }
    }

    // Add 2 reviews per course so ratings look vibrant
    await Review.create({
      student: student._id,
      course: course._id,
      rating: 5,
      comment: "Absolutely top tier course! The explanations are crystal clear and the projects are very practical. Highly recommended!"
    });
  }

  // Pre-enroll student in the free React course so they have an active course in My Courses!
  const freeReactCourse = await Course.findOne({ price: 0 });
  if (freeReactCourse) {
    await Enrollment.create({
      student: student._id,
      course: freeReactCourse._id,
      enrolledAt: new Date()
    });

    await Progress.create({
      student: student._id,
      course: freeReactCourse._id,
      completedLessons: [],
      percentage: 0
    });
    console.log(`Pre-enrolled student@coursea.com in: "${freeReactCourse.title}"`);
  }

  console.log("\n=============================================");
  console.log("Database seeded successfully with REAL courses!");
  console.log("Credentials:");
  console.log("- Admin:      admin@coursea.com   | password123");
  console.log("- Instructor: brad@coursea.com    | password123");
  console.log("- Instructor: angela@coursea.com  | password123");
  console.log("- Student:    student@coursea.com | password123");
  console.log("=============================================\n");

  process.exit(0);
}

seedData().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
