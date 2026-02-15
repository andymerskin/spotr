declare module 'astro-icon/components' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

  interface IconProps {
    /** The name of the icon to include */
    name: string;
    /** Shorthand for including a {props.title} element in the SVG */
    title?: string;
    /** Shorthand for including a {props.desc} element in the SVG */
    desc?: string;
    /** Shorthand for setting width and height */
    size?: number | string;
    width?: number | string;
    height?: number | string;
    class?: string;
    [key: string]: any;
  }

  export const Icon: AstroComponentFactory<IconProps>;
}
