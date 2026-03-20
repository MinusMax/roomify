import puter from '@heyputer/puter.js'
import {getOrCreateHostngConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

export const signIn = async () => {
    return await puter.auth.signIn();
};

export const signOut = async () => {
    return puter.auth.signOut();
}

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

<<<<<<< HEAD
export const createProject = async ({ item, visibility = "private"} : CreateProjectParams) :
    Promise<DesignItem | null | undefined>  => {
      // ... existing code ...
      const payload = {
          ... rest,
          isPublic: visibility === "public",
          sourceImage : resolvedSource,
          renderedImage : resolvedRender,
      }
      // ... rest of function ...
=======
export const createProject = async ({ item, visibility} : CreateProjectParams) :
    Promise<DesignItem | null>  => {
>>>>>>> eb6e672 (fix coderabbit suggested bug)
     const projectId = item.id;

     const hosting = await getOrCreateHostngConfig();

     const hostedSource = projectId ?
         await uploadImageToHosting({
             hosting, url: item.sourceImage , projectId , label: "source",
         }) : null;

     const hostedRendered = projectId && item.renderedImage ?
         await uploadImageToHosting({
             hosting, url: item.renderedImage , projectId , label: "rendered",
         }) : null;

     const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');

     if(!resolvedSource) {
         console.warn("Failed to resolve source image, skipping save");
         return null;
     }

     const resolvedRender = hostedRendered?.url
    ? hostedRendered?.url
         : item.renderedImage && isHostedUrl(item.renderedImage)
             ? item.renderedImage
             : undefined;

     const {
         sourcePath: _sourcePath,
         renderedPath: _renderedPath,
         publicPath: _publicPath,
         ... rest
     } = item;

     const payload: DesignItem = {
         ... rest,
         sourceImage : resolvedSource,
         renderedImage : resolvedRender,
         isPublic: visibility === 'public'
     }

     return payload;
}