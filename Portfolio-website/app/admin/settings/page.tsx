'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Globe,
  Mail,
  Shield,
  Palette,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site: {
      title: 'JXCOB Portfolio',
      description: 'Full-Stack Developer & N8N Automation Expert',
      url: 'https://jxcob.dev',
      author: 'Jacob Jaballah',
    },
    contact: {
      email: 'hello@jxcobcreations.com',
      location: 'Available Remotely',
      timezone: 'Asia/Kuala_Lumpur',
    },
    features: {
      analyticsEnabled: true,
      contactFormEnabled: true,
      darkModeEnabled: true,
      animationsEnabled: true,
    },
    cms: {
      backupEnabled: true,
      autoSaveInterval: 30,
      maxProjects: 50,
      cacheEnabled: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLastSaved(new Date());
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to defaults
      setSettings({
        site: {
          title: 'JXCOB Portfolio',
          description: 'Full-Stack Developer & N8N Automation Expert',
          url: 'https://jxcob.dev',
          author: 'Jacob Jaballah',
        },
        contact: {
          email: 'hello@jxcobcreations.com',
          location: 'Available Remotely',
          timezone: 'Asia/Kuala_Lumpur',
        },
        features: {
          analyticsEnabled: true,
          contactFormEnabled: true,
          darkModeEnabled: true,
          animationsEnabled: true,
        },
        cms: {
          backupEnabled: true,
          autoSaveInterval: 30,
          maxProjects: 50,
          cacheEnabled: true,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">System configuration and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <Badge variant="outline" className="text-xs">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Configuration
            </CardTitle>
            <CardDescription>Basic site information and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-title">Site Title</Label>
              <Input
                id="site-title"
                value={settings.site.title}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site: { ...prev.site, title: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-description">Description</Label>
              <Textarea
                id="site-description"
                value={settings.site.description}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site: { ...prev.site, description: e.target.value },
                  }))
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-url">Site URL</Label>
              <Input
                id="site-url"
                type="url"
                value={settings.site.url}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site: { ...prev.site, url: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-author">Author</Label>
              <Input
                id="site-author"
                value={settings.site.author}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site: { ...prev.site, author: e.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Contact details and location settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-location">Location</Label>
              <Input
                id="contact-location"
                value={settings.contact.location}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, location: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-timezone">Timezone</Label>
              <Select
                value={settings.contact.timezone}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, timezone: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
            <CardDescription>Enable or disable site features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Tracking</Label>
                <div className="text-muted-foreground text-sm">
                  Enable visitor analytics and tracking
                </div>
              </div>
              <Switch
                checked={settings.features.analyticsEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, analyticsEnabled: checked },
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Contact Form</Label>
                <div className="text-muted-foreground text-sm">
                  Allow visitors to send contact messages
                </div>
              </div>
              <Switch
                checked={settings.features.contactFormEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, contactFormEnabled: checked },
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <div className="text-muted-foreground text-sm">Enable dark mode theme support</div>
              </div>
              <Switch
                checked={settings.features.darkModeEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, darkModeEnabled: checked },
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <div className="text-muted-foreground text-sm">
                  Enable cyberpunk animations and effects
                </div>
              </div>
              <Switch
                checked={settings.features.animationsEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, animationsEnabled: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* CMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              CMS Configuration
            </CardTitle>
            <CardDescription>Content management system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <div className="text-muted-foreground text-sm">
                  Create automatic backups of content
                </div>
              </div>
              <Switch
                checked={settings.cms.backupEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    cms: { ...prev.cms, backupEnabled: checked },
                  }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="autosave-interval">Auto-save Interval (seconds)</Label>
              <Input
                id="autosave-interval"
                type="number"
                min="10"
                max="300"
                value={settings.cms.autoSaveInterval}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    cms: { ...prev.cms, autoSaveInterval: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-projects">Maximum Projects</Label>
              <Input
                id="max-projects"
                type="number"
                min="1"
                max="100"
                value={settings.cms.maxProjects}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    cms: { ...prev.cms, maxProjects: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cache Optimization</Label>
                <div className="text-muted-foreground text-sm">
                  Enable caching for better performance
                </div>
              </div>
              <Switch
                checked={settings.cms.cacheEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    cms: { ...prev.cms, cacheEnabled: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>Current system status and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">CMS VERSION</Label>
              <div className="font-mono">v1.0.0</div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">NODE VERSION</Label>
              <div className="font-mono">v18.17.0</div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">NEXT.JS VERSION</Label>
              <div className="font-mono">v15.4.5</div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">DATABASE</Label>
              <div className="font-mono">In-Memory</div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">UPTIME</Label>
              <div className="font-mono">2h 45m</div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">ENVIRONMENT</Label>
              <div className="font-mono">Development</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
