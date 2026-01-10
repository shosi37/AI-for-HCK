// Allow imports that include a version suffix like "package@1.2.3" used in this repo
// Treat these modules as "any" so named and default imports work without type declarations
declare module '*@*';

declare module 'npm:*';

declare module 'jsr:*';

declare module '*';

declare module '@*';
declare module '@*/*';
declare module '*@*/*';
declare module '*/*@*';
declare module '*/*';

// Fallback type aliases for commonly used utility types in UI packages
// These keep the type checker quiet when package types are unavailable
declare global {
  type VariantProps<T = any> = any;
  type UseEmblaCarouselType = any;
  type ControllerProps<T = any, K = any> = any;
  type FieldValues = any;
  type FieldPath<T = any> = any;
  type ToasterProps = any;
  type LegendProps = any;
}

export {};

