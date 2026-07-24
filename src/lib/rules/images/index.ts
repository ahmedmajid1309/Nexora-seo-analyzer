import type { RuleDefinition } from "../types";
import { altEmpty } from "./alt-empty";
import { altLength } from "./alt-length";
import { altMissing } from "./alt-missing";
import { imageDimensions } from "./image-dimensions";
import { imageMalformedUrl } from "./image-malformed-url";
import { imageNoSrc } from "./image-no-src";
import { lazyLoading } from "./lazy-loading";
import { modernFormat } from "./modern-format";

export const imageRules: RuleDefinition[] = [
  altMissing,
  altEmpty,
  imageNoSrc,
  imageMalformedUrl,
  imageDimensions,
  altLength,
  modernFormat,
  lazyLoading,
];
