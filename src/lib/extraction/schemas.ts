import { z } from "zod";

export const ExtractionWarningCodeSchema = z.enum([
  "MALFORMED_HTML",
  "MISSING_HEAD",
  "MISSING_BODY",
  "INVALID_BASE_URL",
  "COLLECTION_TRUNCATED",
  "TEXT_TRUNCATED",
  "INVALID_JSON_LD",
  "UNSUPPORTED_URL_RESOLUTION",
  "DUPLICATE_IDS",
  "PARSER_LIMITATION",
]);

export const ExtractionWarningSchema = z.object({
  code: ExtractionWarningCodeSchema,
  message: z.string(),
  details: z.string().optional(),
});

export const ElementReferenceSchema = z.object({
  tag: z.string(),
  id: z.string().optional(),
  classNames: z.array(z.string()).optional(),
  domPath: z.string().optional(),
  order: z.number(),
});

export const DocumentInfoSchema = z.object({
  url: z.string(),
  lang: z.string().nullable(),
  dir: z.string().nullable(),
  title: z.string().nullable(),
  titleElementCount: z.number(),
  charsetDeclarations: z.array(
    z.object({
      raw: z.string(),
      normalized: z.string().nullable(),
      elementOrder: z.number(),
    }),
  ),
  viewportDeclarations: z.array(
    z.object({
      raw: z.string(),
      elementOrder: z.number(),
    }),
  ),
  baseHref: z.string().nullable(),
  hasBody: z.boolean(),
  hasHead: z.boolean(),
  approxDomNodeCount: z.number(),
  declaredLanguage: z.string().nullable(),
});

export const MetadataEntrySchema = z.object({
  name: z.string(),
  rawValue: z.string(),
  normalizedValue: z.string().nullable(),
  sourceAttribute: z.string(),
  elementOrder: z.number(),
  selector: z.string().optional(),
});

export const HeadingInfoSchema = z.object({
  level: z.number().min(1).max(6),
  text: z.string(),
  rawTextLength: z.number(),
  isEmpty: z.boolean(),
  isHidden: z.boolean(),
  elementId: z.string().nullable(),
  selector: z.string().optional(),
  order: z.number(),
});

export const LinkInfoSchema = z.object({
  rawHref: z.string(),
  resolvedUrl: z.string().nullable(),
  protocol: z.string().nullable(),
  hostname: z.string().nullable(),
  isSameOrigin: z.boolean(),
  isSameHost: z.boolean(),
  fragment: z.string().nullable(),
  anchorText: z.string(),
  title: z.string().nullable(),
  relTokens: z.array(z.string()),
  target: z.string().nullable(),
  hasDownload: z.boolean(),
  hreflang: z.string().nullable(),
  media: z.string().nullable(),
  elementOrder: z.number(),
  selector: z.string().optional(),
  classification: z.enum([
    "http",
    "https",
    "fragment",
    "mailto",
    "tel",
    "javascript",
    "data",
    "empty",
    "malformed",
    "other-scheme",
  ]),
});

export const ImageInfoSchema = z.object({
  rawSrc: z.string(),
  resolvedSrc: z.string().nullable(),
  srcset: z.string().nullable(),
  sizes: z.string().nullable(),
  hasAlt: z.boolean(),
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  loading: z.string().nullable(),
  decoding: z.string().nullable(),
  fetchPriority: z.string().nullable(),
  referrerPolicy: z.string().nullable(),
  elementOrder: z.number(),
  selector: z.string().optional(),
  parentPicture: z.boolean(),
});

export const StructuredDataBlockSchema = z.object({
  rawSample: z.string(),
  parseSuccess: z.boolean(),
  parsedTypes: z.array(z.string()),
  context: z.string().nullable(),
  elementOrder: z.number(),
  selector: z.string().optional(),
  parseErrorCategory: z.enum(["none", "syntax-error", "not-object-or-array", "truncated", "other"]),
});

export const MicrodataSignalSchema = z.object({
  present: z.boolean(),
  itemCount: z.number(),
  itemTypes: z.array(z.string()),
});

export const RdfaSignalSchema = z.object({
  present: z.boolean(),
  typeofCount: z.number(),
  propertyCount: z.number(),
});

export const OpenGraphEntrySchema = z.object({
  property: z.string(),
  content: z.string(),
  elementOrder: z.number(),
});

export const TwitterCardEntrySchema = z.object({
  name: z.string(),
  content: z.string(),
  elementOrder: z.number(),
});

export const SocialMetadataSchema = z.object({
  openGraph: z.array(OpenGraphEntrySchema),
  twitter: z.array(TwitterCardEntrySchema),
});

export const ContentMetricsSchema = z.object({
  visibleText: z.string(),
  totalChars: z.number(),
  wordCount: z.number(),
  paragraphCount: z.number(),
  sentenceCount: z.number(),
  listCount: z.number(),
  listItemCount: z.number(),
  tableCount: z.number(),
  blockquoteCount: z.number(),
  codePreCount: z.number(),
  hasMain: z.boolean(),
  articleCount: z.number(),
  sectionCount: z.number(),
  navCount: z.number(),
  headerCount: z.number(),
  footerCount: z.number(),
  asideCount: z.number(),
  addressCount: z.number(),
  timeElements: z.array(
    z.object({
      datetime: z.string().nullable(),
      text: z.string(),
      elementOrder: z.number(),
    }),
  ),
  questionHeadingCount: z.number(),
  isTruncated: z.boolean(),
});

export const AccessibilitySignalsSchema = z.object({
  documentLanguage: z.string().nullable(),
  imageAltPresent: z.object({ total: z.number(), withAlt: z.number(), withoutAlt: z.number() }),
  formLabelRelationships: z.object({
    total: z.number(),
    withLabel: z.number(),
    withoutLabel: z.number(),
  }),
  inputAccessibleNames: z.object({
    total: z.number(),
    withName: z.number(),
    withoutName: z.number(),
  }),
  buttonTextSignals: z.object({ total: z.number(), withText: z.number(), withoutText: z.number() }),
  linkAccessibleNames: z.object({
    total: z.number(),
    withName: z.number(),
    withoutName: z.number(),
  }),
  landmarkElements: z.object({
    nav: z.number(),
    header: z.number(),
    footer: z.number(),
    aside: z.number(),
    main: z.number(),
    section: z.number(),
  }),
  headingElements: z.object({ total: z.number() }),
  skipLinkCandidates: z.array(
    z.object({ href: z.string(), text: z.string(), elementOrder: z.number() }),
  ),
  tableHeaderCells: z.object({ totalTh: z.number() }),
  ariaAttributes: z.object({ total: z.number(), roles: z.array(z.string()) }),
  duplicateIds: z.array(z.string()),
  tabindexValues: z.array(z.object({ value: z.number(), elementOrder: z.number() })),
  iframeTitles: z.object({ total: z.number(), withTitle: z.number(), withoutTitle: z.number() }),
  mediaCaptions: z.object({ total: z.number(), withTrack: z.number(), withoutTrack: z.number() }),
  viewportZoomRestricted: z.boolean(),
});

export const FormInputInfoSchema = z.object({
  type: z.string().nullable(),
  name: z.string().nullable(),
  id: z.string().nullable(),
  hasPlaceholder: z.boolean(),
  required: z.boolean(),
  disabled: z.boolean(),
  associatedLabel: z.string().nullable(),
  labelRelationship: z.enum(["explicit", "implicit", "aria-label", "aria-labelledby", "none"]),
  isSubmit: z.boolean(),
  isPassword: z.boolean(),
  isFile: z.boolean(),
  isHidden: z.boolean(),
  redactedValue: z.boolean(),
  elementOrder: z.number(),
});

export const FormDetailSchema = z.object({
  action: z.string().nullable(),
  method: z.string().nullable(),
  autocomplete: z.string().nullable(),
  novalidate: z.boolean(),
  inputs: z.array(FormInputInfoSchema),
  submitCount: z.number(),
  elementOrder: z.number(),
});

export const FormInfoSchema = z.object({
  formCount: z.number(),
  forms: z.array(FormDetailSchema),
});

export const ResourceInfoSchema = z.object({
  type: z.enum([
    "script",
    "stylesheet",
    "preload",
    "prefetch",
    "preconnect",
    "modulepreload",
    "font",
    "iframe",
    "video",
    "audio",
    "source",
    "other",
  ]),
  rawUrl: z.string().nullable(),
  resolvedUrl: z.string().nullable(),
  async: z.boolean(),
  defer: z.boolean(),
  isModule: z.boolean(),
  media: z.string().nullable(),
  crossorigin: z.string().nullable(),
  hasIntegrity: z.boolean(),
  loading: z.string().nullable(),
  elementOrder: z.number(),
  selector: z.string().optional(),
});

export const ResponseSnapshotSchema = z.object({
  status: z.number(),
  contentType: z.string(),
  byteLength: z.number(),
  redirectChain: z.array(z.object({ url: z.string(), statusCode: z.number() })),
  timing: z.object({
    dns: z.number(),
    connect: z.number(),
    tls: z.number(),
    firstByte: z.number(),
    total: z.number(),
  }),
});

export const PageSnapshotSchema = z.object({
  schemaVersion: z.string(),
  extractedAt: z.string(),
  requestedUrl: z.string(),
  finalUrl: z.string(),
  response: ResponseSnapshotSchema,
  document: DocumentInfoSchema,
  metadata: z.array(MetadataEntrySchema),
  headings: z.array(HeadingInfoSchema),
  links: z.array(LinkInfoSchema),
  images: z.array(ImageInfoSchema),
  structuredData: z.array(StructuredDataBlockSchema),
  microdata: MicrodataSignalSchema,
  rdfa: RdfaSignalSchema,
  social: SocialMetadataSchema,
  content: ContentMetricsSchema,
  accessibility: AccessibilitySignalsSchema,
  forms: FormInfoSchema,
  resources: z.array(ResourceInfoSchema),
  extractionWarnings: z.array(ExtractionWarningSchema),
});

export type PageSnapshot = z.infer<typeof PageSnapshotSchema>;
export type ExtractionWarning = z.infer<typeof ExtractionWarningSchema>;
