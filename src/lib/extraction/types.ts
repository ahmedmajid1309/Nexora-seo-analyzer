export type ExtractionWarningCode =
  | "MALFORMED_HTML"
  | "MISSING_HEAD"
  | "MISSING_BODY"
  | "INVALID_BASE_URL"
  | "COLLECTION_TRUNCATED"
  | "TEXT_TRUNCATED"
  | "INVALID_JSON_LD"
  | "UNSUPPORTED_URL_RESOLUTION"
  | "DUPLICATE_IDS"
  | "PARSER_LIMITATION";

export interface ExtractionWarning {
  code: ExtractionWarningCode;
  message: string;
  details?: string;
}

export interface ElementReference {
  tag: string;
  id?: string;
  classNames?: string[];
  domPath?: string;
  order: number;
}

export interface DocumentInfo {
  url: string;
  lang: string | null;
  dir: string | null;
  title: string | null;
  titleElementCount: number;
  charsetDeclarations: { raw: string; normalized: string | null; elementOrder: number }[];
  viewportDeclarations: { raw: string; elementOrder: number }[];
  baseHref: string | null;
  hasBody: boolean;
  hasHead: boolean;
  approxDomNodeCount: number;
  declaredLanguage: string | null;
}

export interface MetadataEntry {
  name: string;
  rawValue: string;
  normalizedValue: string | null;
  sourceAttribute: string;
  elementOrder: number;
  selector?: string;
}

export interface HeadingInfo {
  level: number;
  text: string;
  rawTextLength: number;
  isEmpty: boolean;
  isHidden: boolean;
  elementId: string | null;
  selector?: string;
  order: number;
}

export interface LinkInfo {
  rawHref: string;
  resolvedUrl: string | null;
  protocol: string | null;
  hostname: string | null;
  isSameOrigin: boolean;
  isSameHost: boolean;
  fragment: string | null;
  anchorText: string;
  title: string | null;
  relTokens: string[];
  target: string | null;
  hasDownload: boolean;
  hreflang: string | null;
  media: string | null;
  elementOrder: number;
  selector?: string;
  classification:
    | "http"
    | "https"
    | "fragment"
    | "mailto"
    | "tel"
    | "javascript"
    | "data"
    | "empty"
    | "malformed"
    | "other-scheme";
}

export interface ImageInfo {
  rawSrc: string;
  resolvedSrc: string | null;
  srcset: string | null;
  sizes: string | null;
  hasAlt: boolean;
  altText: string | null;
  width: number | null;
  height: number | null;
  loading: string | null;
  decoding: string | null;
  fetchPriority: string | null;
  referrerPolicy: string | null;
  elementOrder: number;
  selector?: string;
  parentPicture: boolean;
}

export interface StructuredDataBlock {
  rawSample: string;
  parseSuccess: boolean;
  parsedTypes: string[];
  context: string | null;
  elementOrder: number;
  selector?: string;
  parseErrorCategory: "none" | "syntax-error" | "not-object-or-array" | "truncated" | "other";
}

export interface MicrodataSignal {
  present: boolean;
  itemCount: number;
  itemTypes: string[];
}

export interface RdfaSignal {
  present: boolean;
  typeofCount: number;
  propertyCount: number;
}

export interface OpenGraphEntry {
  property: string;
  content: string;
  elementOrder: number;
}

export interface TwitterCardEntry {
  name: string;
  content: string;
  elementOrder: number;
}

export interface SocialMetadata {
  openGraph: OpenGraphEntry[];
  twitter: TwitterCardEntry[];
}

export interface ContentMetrics {
  visibleText: string;
  totalChars: number;
  wordCount: number;
  paragraphCount: number;
  sentenceCount: number;
  listCount: number;
  listItemCount: number;
  tableCount: number;
  blockquoteCount: number;
  codePreCount: number;
  hasMain: boolean;
  articleCount: number;
  sectionCount: number;
  navCount: number;
  headerCount: number;
  footerCount: number;
  asideCount: number;
  addressCount: number;
  timeElements: { datetime: string | null; text: string; elementOrder: number }[];
  questionHeadingCount: number;
  isTruncated: boolean;
}

export interface AccessibilitySignals {
  documentLanguage: string | null;
  imageAltPresent: { total: number; withAlt: number; withoutAlt: number };
  formLabelRelationships: { total: number; withLabel: number; withoutLabel: number };
  inputAccessibleNames: { total: number; withName: number; withoutName: number };
  buttonTextSignals: { total: number; withText: number; withoutText: number };
  linkAccessibleNames: { total: number; withName: number; withoutName: number };
  landmarkElements: {
    nav: number;
    header: number;
    footer: number;
    aside: number;
    main: number;
    section: number;
  };
  headingElements: { total: number };
  skipLinkCandidates: { href: string; text: string; elementOrder: number }[];
  tableHeaderCells: { totalTh: number };
  ariaAttributes: { total: number; roles: string[] };
  duplicateIds: string[];
  tabindexValues: { value: number; elementOrder: number }[];
  iframeTitles: { total: number; withTitle: number; withoutTitle: number };
  mediaCaptions: { total: number; withTrack: number; withoutTrack: number };
  viewportZoomRestricted: boolean;
}

export interface FormInfo {
  formCount: number;
  forms: FormDetail[];
}

export interface FormDetail {
  action: string | null;
  method: string | null;
  autocomplete: string | null;
  novalidate: boolean;
  inputs: FormInputInfo[];
  submitCount: number;
  elementOrder: number;
}

export interface FormInputInfo {
  type: string | null;
  name: string | null;
  id: string | null;
  hasPlaceholder: boolean;
  required: boolean;
  disabled: boolean;
  associatedLabel: string | null;
  labelRelationship: "explicit" | "implicit" | "aria-label" | "aria-labelledby" | "none";
  isSubmit: boolean;
  isPassword: boolean;
  isFile: boolean;
  isHidden: boolean;
  redactedValue: boolean;
  elementOrder: number;
}

export interface ResourceInfo {
  type:
    | "script"
    | "stylesheet"
    | "preload"
    | "prefetch"
    | "preconnect"
    | "modulepreload"
    | "font"
    | "iframe"
    | "video"
    | "audio"
    | "source"
    | "other";
  rawUrl: string | null;
  resolvedUrl: string | null;
  async: boolean;
  defer: boolean;
  isModule: boolean;
  media: string | null;
  crossorigin: string | null;
  hasIntegrity: boolean;
  loading: string | null;
  elementOrder: number;
  selector?: string;
}

export interface ResponseSnapshot {
  status: number;
  contentType: string;
  byteLength: number;
  redirectChain: { url: string; statusCode: number }[];
  timing: { dns: number; connect: number; tls: number; firstByte: number; total: number };
}

export interface PageSnapshot {
  schemaVersion: string;
  extractedAt: string;
  requestedUrl: string;
  finalUrl: string;
  response: ResponseSnapshot;
  document: DocumentInfo;
  metadata: MetadataEntry[];
  headings: HeadingInfo[];
  links: LinkInfo[];
  images: ImageInfo[];
  structuredData: StructuredDataBlock[];
  microdata: MicrodataSignal;
  rdfa: RdfaSignal;
  social: SocialMetadata;
  content: ContentMetrics;
  accessibility: AccessibilitySignals;
  forms: FormInfo;
  resources: ResourceInfo[];
  extractionWarnings: ExtractionWarning[];
}
