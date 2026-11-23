import { pruneOriginalBuildCopies } from './scripts/web-media.mjs';
import { workLayoutDev } from './scripts/work-layout-dev.mjs';
import { pdfAssets } from './scripts/pdf-assets.mjs';
import { projectGalleryFiles } from './scripts/project-gallery-files.mjs';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => {
    const development = command === 'serve' && !isPreview;
    // Local dev stays at /. Builds and previews target the GitHub project site.
    const portfolioBase = process.env.PORTFOLIO_BASE_PATH ?? (development ? '' : '/portfolio');
    if (portfolioBase && (!portfolioBase.startsWith('/') || portfolioBase.endsWith('/'))) {
        throw new Error('PORTFOLIO_BASE_PATH must start with / and have no trailing slash');
    }
    return {
        optimizeDeps: { include: ['svelte-dnd-action'] },
        plugins: [
            projectGalleryFiles(),
            pdfAssets(),
            workLayoutDev(),
            sveltekit({
                paths: { base: portfolioBase },
                compilerOptions: {
                    runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
                },
                adapter: {
                    ...adapter({ pages: 'build', assets: 'build', fallback: '404.html', precompress: false, strict: true }),
                    async adapt(builder) {
                        await adapter({ pages: 'build', assets: 'build', fallback: '404.html', precompress: false, strict: true }).adapt(builder);
                        pruneOriginalBuildCopies();
                    }
                }
            })
        ]
    };
});
