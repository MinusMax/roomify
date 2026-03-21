import puter from "@heyputer/puter.js";
import {getOrCreateHostngConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";
import {PUTER_WORKER_URL, IS_VALID_PUTER_WORKER_URL} from "./constants";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const projectId = item.id;

    const hosting = await getOrCreateHostngConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: 'source', }) : null;

    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: 'rendered', }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
            ? item.sourceImage
            : ''
    );

    if(!resolvedSource) {
        console.warn('Failed to host source image, skipping save.')
        return null;
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    }

    if (!IS_VALID_PUTER_WORKER_URL) {
        try {
            const indexKey = "roomify_projects_index";
            const projectKey = `roomify_project_${payload.id}`;

            // Save project data
            await puter.kv.set(projectKey, payload);

            // Update index
            const index = (await puter.kv.get(indexKey)) as string[] || [];
            if (!index.includes(payload.id)) {
                await puter.kv.set(indexKey, [payload.id, ...index]);
            }

            return payload;
        } catch (e) {
            console.error("Failed to save project to Puter KV", e);
            return null;
        }
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            body: JSON.stringify({
                project: payload,
                visibility
            })
        });

        if(!response.ok) {
            console.error('failed to save the project', await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null }

        return data?.project ?? null;
    } catch (e) {
        console.log('Failed to save project', e)
        return null;
    }
}

export const getProjects = async () => {
    if (!IS_VALID_PUTER_WORKER_URL) {
        try {
            const indexKey = "roomify_projects_index";
            const ids = (await puter.kv.get(indexKey)) as string[] || [];

            const projects = await Promise.all(
                ids.map(async (id) => {
                    return (await puter.kv.get(`roomify_project_${id}`)) as DesignItem | null;
                })
            );

            return projects.filter((p): p is DesignItem => p !== null);
        } catch (e) {
            console.error("Failed to get projects from Puter KV", e);
            return [];
        }
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, { method: 'GET' });

        if(!response.ok) {
            console.error('Failed to fetch history', await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };

        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (e) {
        console.error('Failed to get projects', e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!IS_VALID_PUTER_WORKER_URL) {
        try {
            return (await puter.kv.get(`roomify_project_${id}`)) as DesignItem | null;
        } catch (e) {
            console.error("Failed to get project from Puter KV", e);
            return null;
        }
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};