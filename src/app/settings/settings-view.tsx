
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsView() {
  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </header>
      <Card>
        <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Theme settings and other appearance options will be available here in a future update. The app currently respects your system's light/dark mode preference.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
