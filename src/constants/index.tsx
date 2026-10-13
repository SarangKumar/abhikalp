import { PricingCardProps } from "@/components/pricing/pricing-card";
import {
  Box,
  Brain,
  FilePlus2,
  Globe,
  LayoutList,
  LucideHome,
  Settings,
} from "lucide-react";

import { features } from "@/config/features";

export const dashboardNavbarLinks = [
  {
    name: "Projects",
    links: [
      {
        title: "My Projects",
        href: "/dashboard",
      },
      {
        title: "Create New Projects",
        href: "/dashboard/create/project",
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
      },
    ],
  },
  {
    name: "Documentation",
    links: [
      {
        title: "Guides",
        href: "/docs#guides",
      },
      {
        title: "API Reference",
        href: "/docs#api",
      },
    ],
  },
];

export const projectSidebarLinks = [
  {
    name: "Home",
    links: [
      {
        title: "Home",
        href: "",
        icon: <LucideHome size={18} className="stroke-[1.5]" />,
      },
    ],
  },
  {
    name: "Tasks",
    links: [
      {
        title: "Todo",
        href: "/todo",
        icon: <LayoutList size={18} className="stroke-[1.5]" />,
      },
      {
        title: "Docs",
        href: "/documentation",
        icon: <FilePlus2 size={18} className="stroke-[1.5]" />,
      },
    ],
  },
  {
    name: "Scrape",
    links: [
      {
        title: "Web Scrape",
        icon: <Globe size={18} className="stroke-[1.5]" />,
        href: "/web-scrape",
      },
      ...(features.aiAssistant
        ? [
            {
              title: "AI Assistance",
              icon: <Brain size={18} className="stroke-[1.5]" />,
              href: "/ai-assistance",
            },
          ]
        : []),
      {
        title: "Package Finder",
        icon: <Box size={18} className="stroke-[1.5]" />,
        href: "/package",
      },
    ],
  },
  {
    name: "Settings",
    links: [
      {
        title: "Settings",
        icon: <Settings size={18} className="stroke-[1.5]" />,
        href: "/settings",
      },
    ],
  },
];

export const navLinks = [
  {
    title: "Docs",
    href: "/docs",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];

export const pricingPlans: PricingCardProps[] = [
  {
    tier: "FREE",
    name: "Free",
    description: "Essential Tools for Starters",
    price: 0,
    features: [
      {
        title: "Create up to 3 projects",
        description: "Manage a few projects with ease using our basic tools.",
      },
      {
        title: "Basic task management features",
        description: "Track tasks with simple, effective tools.",
      },
      {
        title: "Standard AI support",
        description: "Receive AI assistance for standard project tasks.",
      },
      {
        title: "Secure sharing with short-term links",
        description:
          "Share your projects securely with links that expire after a short duration.",
      },
      {
        title: "Fundamental collaboration tools",
        description: "Collaborate with team members using basic tools.",
      },
    ],
  },
  {
    tier: "GOLD",
    name: "Gold",
    description: "Advanced Features for Growing Teams",
    price: 299.99,
    isPopular: true,
    footerText: "Most Popular",
    pricingHeader: "Includes everything in Free, plus:",
    features: [
      {
        title: "Create up to 10 projects",
        description: "Manage a more projects with ease using our basic tools.",
      },
      {
        title: "Priority-based task management",
        description: "Set priorities and manage tasks efficiently.",
      },
      {
        title: "Enhanced AI support with contextual responses",
        description: "Get more accurate and context-aware AI assistance.",
      },
      {
        title: "Secure sharing with customizable link expiration",
        description: "Control the duration and access of your shared links.",
      },
      {
        title: "Enhanced collaboration tools with role-based access",
        description:
          "Collaborate effectively with advanced tools and role-specific access controls.",
      },
      {
        title: "Access to premium templates and themes",
        description: "Use exclusive templates and themes for your projects.",
      },
    ],
  },
  {
    tier: "PLATINUM",
    name: "Platinum",
    description: "Comprehensive Tools for Professionals",
    pricingHeader: "Includes everything in Gold, plus: ",
    price: 499.99,
    features: [
      {
        title: "All features from the Gold Plan",
        description: "Includes all advanced features for a complete toolkit.",
      },
      {
        title: "Create up to 30 projects",
        description:
          "Manage a more projects with ease using our advance tools.",
      },
      {
        title: "Priority support and onboarding assistance",
        description: "Get top-tier support and help getting started.",
      },
      {
        title:
          "Premium AI support with advanced model for better chat responses",
        description:
          "Utilize our most advanced AI model for superior assistance.",
      },
      {
        title: "Advanced analytics and reporting",
        description: "Gain insights with detailed analytics and reports.",
      },
      {
        title: "Customizable workflows and integrations",
        description:
          "Tailor workflows and integrate with other tools seamlessly.",
      },
      {
        title: "Enterprise-grade security and compliance",
        description:
          "Ensure your projects are secure with top-level security features.",
      },
      {
        title: "Dedicated account manager",
        description:
          "Receive personalized assistance from a dedicated account manager.",
      },
    ],
  },
];

export interface PricingFeature {
  feature: { title: string; description: string };
  FREE: { title: string; description: string };
  GOLD: { title: string; description: string };
  PLATINUM: { title: string; description: string };
}

export const pricingFeatures: PricingFeature[] = [
  {
    feature: {
      title: "Projects",
      description:
        "Create and manage multiple projects with ease. Organize your work and track progress within each project.",
    },
    FREE: {
      title: "Up to 3",
      description: "Manage a few projects with ease using our basic tools.",
    },
    GOLD: {
      title: "Up to 10",
      description: "Manage a more projects with ease using our modern tools.",
    },
    PLATINUM: {
      title: "Up to 30",
      description:
        "Manage a more projects with ease using our most advance tools.",
    },
  },
  {
    feature: {
      title: "Task Management",
      description:
        "Keep track of your to-do lists, deadlines, and progress with robust task management tools. Assign, prioritize, and monitor tasks seamlessly.",
    },
    FREE: {
      title: "Basic",
      description: "Track tasks with simple, effective tools.",
    },
    GOLD: {
      title: "Priority-based",
      description: "Set priorities and manage tasks efficiently.",
    },
    PLATINUM: {
      title: "Priority-based",
      description: "Advanced task management with additional features.",
    },
  },
  {
    feature: {
      title: "AI Support",
      description:
        "Leverage advanced AI capabilities to assist with brainstorming, generating content, providing insights, and automating tasks for improved productivity.",
    },
    FREE: {
      title: "Standard",
      description: "Receive AI assistance for standard project tasks.",
    },
    GOLD: {
      title: "Enhanced",
      description: "Get more accurate and context-aware AI assistance.",
    },
    PLATINUM: {
      title: "Premium",
      description:
        "Utilize our most advanced AI model for superior assistance.",
    },
  },
  {
    feature: {
      title: "Secure Project Sharing",
      description:
        "Share your projects securely with others via links with expiration dates, ensuring your data remains protected.",
    },
    FREE: {
      title: "Limited link expiration",
      description:
        "Share your projects securely with links that expire after a short duration.",
    },
    GOLD: {
      title: "Customizable link expiration",
      description: "Control the duration and access of your shared links.",
    },
    PLATINUM: {
      title: "Customizable link expiration",
      description:
        "Advanced sharing options with full control over link access.",
    },
  },
  {
    feature: {
      title: "Collaboration Tools",
      description:
        "Enhance team collaboration with tools designed for seamless communication and coordination. Work together in real-time, no matter where you are.",
    },
    FREE: {
      title: "Basic",
      description: "Collaborate with team members using basic tools.",
    },
    GOLD: {
      title: "Enhanced",
      description:
        "Collaborate effectively with advanced tools and role-specific access controls.",
    },
    PLATINUM: {
      title: "Enhanced",
      description: "Advanced collaboration tools with additional features.",
    },
  },
  {
    feature: {
      title: "Templates and Themes",
      description:
        "Customize your projects with a variety of templates and themes to suit your style and needs.",
    },
    FREE: { title: "-", description: "" },
    GOLD: {
      title: "Premium",
      description: "Use exclusive templates and themes for your projects.",
    },
    PLATINUM: {
      title: "Premium",
      description:
        "Access to the most premium and customizable templates and themes.",
    },
  },
  {
    feature: {
      title: "Analytics and Reporting",
      description:
        "Gain insights into your projects with detailed analytics. Track performance, monitor progress, and make data-driven decisions.",
    },
    FREE: { title: "-", description: "" },
    GOLD: {
      title: "Basic",
      description:
        "Get basic insights with essential analytics and reporting tools.",
    },
    PLATINUM: {
      title: "Advanced",
      description: "Gain deep insights with advanced analytics and reports.",
    },
  },
  {
    feature: {
      title: "Workflow Customization",
      description:
        "Tailor your workflow to fit your unique needs. Customize processes, set up automation, and streamline your tasks for efficiency.",
    },
    FREE: { title: "-", description: "" },
    GOLD: {
      title: "Basic",
      description: "Tailor basic workflows to your needs.",
    },
    PLATINUM: {
      title: "Advanced",
      description: "Fully customizable workflows and integrations.",
    },
  },
  {
    feature: {
      title: "Security and Compliance",
      description:
        "Ensure your data is secure with top-notch security measures. Your information is protected with industry-standard encryption and security protocols.",
    },
    FREE: {
      title: "Standard",
      description:
        "Ensure your projects are secure with basic security features.",
    },
    GOLD: {
      title: "Advanced",
      description: "Enhanced security measures for added protection.",
    },
    PLATINUM: {
      title: "Enterprise-grade",
      description:
        "Top-level security and compliance features for enterprises.",
    },
  },
  {
    feature: { title: "Dedicated Account Manager", description: "" },
    FREE: { title: "-", description: "" },
    GOLD: { title: "-", description: "" },
    PLATINUM: {
      title: "Yes",
      description:
        "Receive personalized assistance from a dedicated account manager.",
    },
  },
  {
    feature: {
      title: "Support",
      description:
        "Access dedicated support to assist you with any issues or questions. Our support team is here to help you succeed.",
    },
    FREE: {
      title: "Community",
      description: "Get help from the community support forum.",
    },
    GOLD: {
      title: "Priority",
      description: "Receive priority support from our team.",
    },
    PLATINUM: {
      title: "Priority",
      description: "Top-priority support for all your needs.",
    },
  },
  {
    feature: {
      title: "Onboarding Assistance",
      description:
        "Get started quickly with easy onboard access. Our intuitive interface and guided setup ensure you can start using the platform immediately.",
    },
    FREE: { title: "-", description: "" },
    GOLD: { title: "-", description: "" },
    PLATINUM: {
      title: "Yes",
      description:
        "Get assistance with onboarding to help you get started quickly.",
    },
  },
];

export const pricingFaq = [
  {
    question: "What is included in the Free plan?",
    answer:
      "The Free plan includes basic project management features such as the ability to create up to 3 projects, basic task management, standard AI assistance, secure project sharing with limited link expiration, and basic collaboration tools.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes, you can upgrade your plan at any time to access additional features and tools that better meet your needs.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      " We accept all major credit cards. For enterprise customers, we also offer invoicing options.",
  },
];
