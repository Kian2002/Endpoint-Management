"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Shield, Activity, AlertTriangle } from "lucide-react";
import Navbar from "./components/Navbar";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const alerts = [
    {
      type: "System Alert",
      title: "High CPU usage detected on Endpoint X",
      description: "CPU utilization has exceeded 90% for the past 15 minutes. Consider investigating background processes.",

    },
    {
      type: "Security Update",
      title: "Critical security patch available",
      description: "New security update available for Windows endpoints. Recommended to install within 24 hours.",

    },
    {
      type: "Performance Warning",
      title: "Memory usage optimization needed",
      description: "Several endpoints showing high memory usage. Consider process optimization or hardware upgrade.",

    },
  ];

  const keyFeatures = [
    {
      title: "Real-Time Monitoring",
      description: "Monitor your endpoints in real-time with live data feeds, process tracking, and performance metrics."
    },
    {
      title: "Endpoint Security",
      description: "Advanced security monitoring with threat detection, unauthorized access alerts, and compliance tracking."
    },
    {
      title: "Automated Detection",
      description: "AI-powered anomaly detection that automatically identifies and alerts on suspicious activities."
    },
    {
      title: "Comprehensive Reporting",
      description: "Detailed reports and analytics to help you understand your endpoint landscape and make informed decisions."
    }
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <Navbar showAuthButtons={true} />
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16 max-w-7xl mx-auto">

      {/* Hero */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8"
        id="dashboard"
      >
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Realtime Endpoint Management
          </h1>
          <p className="mb-6 text-lg text-gray-600 leading-relaxed">
            Take control of your endpoint infrastructure with our comprehensive monitoring and management platform. 
            Get real-time insights, automated alerts, and powerful analytics to keep your systems secure and optimized.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-medium"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <Image
              src="/images/Hero.png"
              alt="Endpoint Management Dashboard"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="p-8 bg-gray-50" id="endpoints">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Key Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make our endpoint management platform the choice for IT professionals.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg">
              <Image
                src="/images/Key_Features.png"
                alt="Key Features Overview"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="space-y-6">
            {keyFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts & Activity Feed */}
      <section className="p-8" id="alerts">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Real-Time Alerts & Monitoring
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with intelligent alerts and comprehensive activity monitoring across all your endpoints.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/alerts"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View All Alerts
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {alerts.map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
             
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {card.type}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{card.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
                <Link href="/alerts" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center">
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Start Your Free Trial Today
        </h2>
        <p className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto">
          Join thousands of IT professionals who trust our platform to manage their endpoint infrastructure. 
          No credit card required, full access for 14 days.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-bold text-lg"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="p-8 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h2>
        <p className="mb-8 text-lg text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your organization's needs and scale as you grow.
        </p>
        <div className="flex justify-center gap-8">
          <div className="border border-gray-200 p-8 rounded-lg w-80 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Starter</h3>
            <p className="text-3xl font-bold mb-4 text-blue-600">$9.99<span className="text-lg text-gray-500">/month</span></p>
            <ul className="text-left space-y-2 mb-6 text-gray-600">
              <li>• Up to 50 endpoints</li>
              <li>• Basic monitoring</li>
              <li>• Email alerts</li>
              <li>• Standard support</li>
            </ul>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full inline-block"
            >
              Get Started
            </Link>
          </div>
          <div className="border-2 border-blue-600 p-8 rounded-lg w-80 bg-white shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Professional</h3>
            <p className="text-3xl font-bold mb-4 text-blue-600">$29.99<span className="text-lg text-gray-500">/month</span></p>
            <ul className="text-left space-y-2 mb-6 text-gray-600">
              <li>• Up to 500 endpoints</li>
              <li>• Advanced monitoring</li>
              <li>• Real-time alerts</li>
              <li>• Priority support</li>
              <li>• Custom reports</li>
            </ul>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full inline-block"
            >
              Get Started
            </Link>
          </div>
          <div className="border border-gray-200 p-8 rounded-lg w-80 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Enterprise</h3>
            <p className="text-3xl font-bold mb-4 text-blue-600">$99.99<span className="text-lg text-gray-500">/month</span></p>
            <ul className="text-left space-y-2 mb-6 text-gray-600">
              <li>• Unlimited endpoints</li>
              <li>• Full monitoring suite</li>
              <li>• Custom integrations</li>
              <li>• 24/7 support</li>
              <li>• Advanced analytics</li>
            </ul>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full inline-block"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 border-t bg-gray-50">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 Endpoint Manager. All rights reserved.</p>
        </div>
      </footer>

      </div>
    </div>
  );
}
