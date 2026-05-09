'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  ClipboardList,
  Users,
  ShieldCheck,
  BarChart3,
  Bell,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: <Building2 className="h-6 w-6 text-blue-600" />,
    title: 'Project Management',
    desc: 'Track budgets, timelines, and progress across all your construction sites.',
  },
  {
    icon: <ClipboardList className="h-6 w-6 text-green-600" />,
    title: 'Task Tracking',
    desc: 'Assign, schedule, and monitor tasks with real-time status updates.',
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: 'Worker Management',
    desc: 'Manage crews, certifications, hours, and payroll in one place.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-red-600" />,
    title: 'Safety & Compliance',
    desc: 'Log incidents, schedule inspections, and stay OSHA-ready.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-amber-600" />,
    title: 'Analytics',
    desc: 'Get insights on costs, timelines, productivity, and safety metrics.',
  },
  {
    icon: <Bell className="h-6 w-6 text-teal-600" />,
    title: 'Real-time Alerts',
    desc: 'Push, SMS, and email notifications keep your team in sync.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <span className="text-xl font-bold text-gray-900">BuildTrack</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center lg:px-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Construction management,
          <br />
          <span className="text-blue-600">simplified.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
          The all-in-one platform for construction teams. Plan projects, track tasks,
          manage workers, and ensure safety — from the office to the job site.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need to run your sites
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-12">
        <h2 className="text-3xl font-bold text-gray-900">Ready to streamline your builds?</h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-500">
          Join hundreds of construction teams using BuildTrack to deliver on time and on budget.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Free 14-day trial
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime
          </div>
        </div>
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} BuildTrack. All rights reserved.
      </footer>
    </div>
  );
}
