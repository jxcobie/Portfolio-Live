'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'In Dev',
    liveUrl: '',
    repoUrl: '',
    technologies: '',
    detailedContent: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (formData.liveUrl && !isValidUrl(formData.liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid URL';
    }

    if (formData.repoUrl && !isValidUrl(formData.repoUrl)) {
      newErrors.repoUrl = 'Please enter a valid URL';
    }

    if (!formData.technologies.trim()) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Create project data
      const projectData = {
        data: {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          status: formData.status,
          liveUrl: formData.liveUrl || null,
          repoUrl: formData.repoUrl || null,
          detailedContent: formData.detailedContent,
          // Parse technologies as comma-separated values
          technologies: formData.technologies
            .split(',')
            .map((tech) => tech.trim())
            .filter((tech) => tech.length > 0)
            .map((tech, index) => ({
              id: Date.now() + index, // Temporary ID for new technologies
              name: tech,
            })),
        },
      };

      const response = await fetch('http://localhost:1337/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setErrors({ submit: errorData.message || 'Failed to create project' });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Project</h1>
          <p className="text-sm text-gray-600">Create a new portfolio project</p>
        </div>
      </div>

      {/* Error Alert */}
      {errors.submit && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{errors.submit}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential project details and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter project title"
                  required
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="project-url-slug"
                />
                <p className="text-muted-foreground text-xs">
                  Auto-generated from title. Used in project URLs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    clearError('description');
                  }}
                  placeholder="Brief project description"
                  rows={3}
                  required
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Dev">In Development</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deployed">Deployed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Links and Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Links & Technologies</CardTitle>
              <CardDescription>External links and technology stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL</Label>
                <Input
                  id="liveUrl"
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, liveUrl: e.target.value }));
                    clearError('liveUrl');
                  }}
                  placeholder="https://example.com"
                  className={errors.liveUrl ? 'border-destructive' : ''}
                />
                {errors.liveUrl && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.liveUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  type="url"
                  value={formData.repoUrl}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, repoUrl: e.target.value }));
                    clearError('repoUrl');
                  }}
                  placeholder="https://github.com/user/repo"
                  className={errors.repoUrl ? 'border-destructive' : ''}
                />
                {errors.repoUrl && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.repoUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies *</Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, technologies: e.target.value }));
                    clearError('technologies');
                  }}
                  placeholder="React, Next.js, TypeScript, etc."
                  required
                  className={errors.technologies ? 'border-destructive' : ''}
                />
                {errors.technologies && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.technologies}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Separate multiple technologies with commas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Content */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Content</CardTitle>
            <CardDescription>
              Rich content for the project case study page (supports HTML)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="detailedContent">Project Case Study</Label>
              <Textarea
                id="detailedContent"
                value={formData.detailedContent}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, detailedContent: e.target.value }))
                }
                placeholder="<h2>Project Overview</h2><p>Detailed description of the project...</p>"
                rows={10}
              />
              <p className="text-muted-foreground text-xs">
                You can use HTML tags for rich formatting (h2, h3, p, ul, li, blockquote, code, pre,
                etc.)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/projects">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
