import { Router } from 'express';

import { ProjectsQuerySchema } from '../../schemas/projects';
import { getProjectById, getProjectBySlug, listProjects } from '../../services/projectService';
import { asyncHandler } from '../../utils/asyncHandler';

export const projectsV1Router = Router();

/* eslint-disable @typescript-eslint/no-misused-promises */

projectsV1Router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parseResult = ProjectsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid query parameters', issues: parseResult.error.issues });
    }

    const result = await listProjects(parseResult.data);
    res.json(result);
  })
);

projectsV1Router.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const result = await listProjects({ page: 1, pageSize: 50, status: 'published' });
    res.json(result);
  })
);

projectsV1Router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Project id must be numeric' });
    }

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ data: project });
  })
);

projectsV1Router.get(
  '/slug/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    const project = await getProjectBySlug(slug);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ data: project });
  })
);

/* eslint-enable @typescript-eslint/no-misused-promises */
