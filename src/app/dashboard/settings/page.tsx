'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { Bell, Shield, User, LogOut, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(false);

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      router.push('/login');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Doe" />
          </div>
          <Input label="Company" placeholder="Your company name" />
          <Input label="Phone" type="tel" placeholder="+1 555-0123" />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <Button>Change Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardContent className="p-6">
          <Button variant="danger" onClick={() => logout.mutate()} loading={logout.isPending}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
