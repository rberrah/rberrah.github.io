export type Chapter = {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  software_verified_on?: string;
  software_version?: string;
  review_pending?: boolean;
  slides?: number[];
  formulas?: string[];
  steps: { title: string; viz?: string; bodyHtml: string }[];
  bodyHtml?: string;
  quiz?: { prompt: string; options: string[]; correct: number }[];
};

declare const chapters: Chapter[];
export default chapters;
