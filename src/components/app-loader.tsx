"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  Globe,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

// Theme Toggle Component
const HomeThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    );
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Toggle theme"
      >
        <CurrentIcon size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;

            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isActive
                    ? "text-[#00B5A5] dark:text-[#00D4C7]"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                <Icon size={16} />
                {themeOption.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
  };

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sections = ["hero", "about", "programs", "membership", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px", // Trigger when section is 20% visible
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  // Navigation link component with active state
  const NavLink = ({
    href,
    children,
    className = "",
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = activeSection === href.replace("#", "");
    return (
      <button
        onClick={() => scrollToSection(href.replace("#", ""))}
        className={`transition-colors ${
          isActive
            ? "text-[#00B5A5] dark:text-[#00D4C7] font-medium"
            : "text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7]"
        } ${className}`}
      >
        {children}
      </button>
    );
  };

  const stats = [
    { number: "500+", label: "Active Members" },
    { number: "50+", label: "Partner Institutions" },
    { number: "25", label: "African Countries" },
    { number: "100+", label: "Research Projects" },
  ];

  const features = [
    {
      icon: Users,
      title: "Professional Network",
      description:
        "Connect with forensic scientists across Africa and build lasting professional relationships.",
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description:
        "Access cutting-edge research, training materials, and certification programs.",
    },
    {
      icon: Award,
      title: "Certification Programs",
      description:
        "Earn recognized certifications to advance your career in forensic science.",
    },
    {
      icon: Globe,
      title: "Global Collaboration",
      description:
        "Participate in international research projects and knowledge exchange programs.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AFSA
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Forensic Sciences Academy
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="#about">About</NavLink>
              <NavLink href="#programs">Programs</NavLink>
              <NavLink href="#membership">Membership</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <HomeThemeToggle />
              <button
                onClick={() => router.push("/login")}
                className="text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Join Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <HomeThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="flex flex-col space-y-4">
                <NavLink href="#about" className="block">
                  About
                </NavLink>
                <NavLink href="#programs" className="block">
                  Programs
                </NavLink>
                <NavLink href="#membership" className="block">
                  Membership
                </NavLink>
                <NavLink href="#contact" className="block">
                  Contact
                </NavLink>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-left text-gray-600 dark:text-gray-300 hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-left"
                  >
                    Join Now
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              African Forensic Sciences Academy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Advancing forensic science education and research across Africa
              through innovative programs and collaborative partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/register")}
                className="bg-white text-[#00B5A5] px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
              >
                Become a Member
                <ArrowRight className="ml-2" size={20} />
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#00B5A5] transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00B5A5] dark:text-[#00D4C7] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About AFSA
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The African Forensic Sciences Academy is a leading institution
              dedicated to advancing forensic science capabilities across the
              African continent through education, research, and professional
              development.
            </p>
          </div>

          <div
            id="programs"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="membership"
        className="py-20 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Connect with forensic professionals, access exclusive resources, and
            advance your career with AFSA membership.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-white text-[#00B5A5] px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105 inline-flex items-center"
          >
            Start Your Application
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 dark:bg-gray-950 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">AFSA</h3>
                  <p className="text-sm text-gray-400">
                    African Forensic Sciences Academy
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Advancing forensic science education and research across Africa
                through innovative programs and collaborative partnerships.
              </p>
              <div className="flex space-x-4">
                <Facebook
                  size={20}
                  className="text-gray-400 hover:text-[#00B5A5] cursor-pointer transition-colors"
                />
                <Twitter
                  size={20}
                  className="text-gray-400 hover:text-[#00B5A5] cursor-pointer transition-colors"
                />
                <Linkedin
                  size={20}
                  className="text-gray-400 hover:text-[#00B5A5] cursor-pointer transition-colors"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#programs"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Programs
                  </a>
                </li>
                <li>
                  <a
                    href="#membership"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Membership
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/login")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Member Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-[#00B5A5]" />
                  <span className="text-gray-400">info@afsa.org</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-[#00B5A5]" />
                  <span className="text-gray-400">+27 11 123 4567</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="text-[#00B5A5] mt-1" />
                  <span className="text-gray-400">
                    Johannesburg, South Africa
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-12 text-center">
            <p className="text-gray-400">
              © 2024 African Forensic Sciences Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
