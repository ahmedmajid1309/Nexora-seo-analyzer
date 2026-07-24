export function makeElementRef(
  el: { attribs?: Record<string, string>; name?: string; tagName?: string },
  order: number,
): {
  tag: string;
  id?: string;
  classNames?: string[];
  order: number;
} {
  const tag = (el.tagName ?? el.name ?? "unknown").toLowerCase();
  const id = el.attribs?.["id"] || undefined;
  const cls = el.attribs?.["class"];
  const classNames = cls ? cls.split(/\s+/).filter(Boolean).slice(0, 3) : undefined;

  return { tag, id, classNames, order };
}

export function buildDomPath(
  el: { attribs?: Record<string, string>; name?: string; tagName?: string },
  parentPath?: string,
): string {
  const tag = (el.tagName ?? el.name ?? "unknown").toLowerCase();
  const id = el.attribs?.["id"];
  if (id) return `${tag}#${id}`;
  const cls = el.attribs?.["class"];
  const classStr = cls ? `.${cls.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}` : "";
  if (parentPath) return `${parentPath} > ${tag}${classStr}`;
  return `${tag}${classStr}`;
}
