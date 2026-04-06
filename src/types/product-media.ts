export type ProductMediaResourceType = "image" | "video";

export interface ProductMedia {
  src: string;
  alt: string;
  type: string;
  resourceType?: ProductMediaResourceType;
  publicId?: string;
  poster?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
}
