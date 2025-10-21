import { getPrismaClient } from '../prisma';
const prisma = getPrismaClient();
export async function listProjects(params) {
    const { page, pageSize, status, search } = params;
    const where = {};
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { short_description: { contains: search } },
            { description: { contains: search } }
        ];
    }
    const skip = (page - 1) * pageSize;
    const [total, data] = await Promise.all([
        prisma.projects.count({ where }),
        prisma.projects.findMany({
            where,
            orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
            skip,
            take: pageSize,
            include: {
                project_images: true
            }
        })
    ]);
    return {
        data,
        meta: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize) || 1
        }
    };
}
export function getProjectById(id) {
    return prisma.projects.findUnique({
        where: { id },
        include: { project_images: true }
    });
}
export function getProjectBySlug(slug) {
    return prisma.projects.findUnique({
        where: { slug },
        include: { project_images: true }
    });
}
