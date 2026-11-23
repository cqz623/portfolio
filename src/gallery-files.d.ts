declare module 'virtual:project-gallery-files' {
  const files: string[];
  export const dimensions: Record<string, {width: number; height: number} | undefined>;
  export default files;
}

declare module 'virtual:project-folders' {
  const folders: string[];
  export default folders;
}

declare module 'virtual:work-layout-editor' {
  const editor: typeof import('#lib/components/WorkLayoutEditor.svelte').default;
  export default editor;
}
