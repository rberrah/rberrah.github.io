export type Chapter = {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  steps: { title: string; body: string; viz: string }[];
  quiz: { prompt: string; options: string[]; correct: number }[];
};

declare const chapters: Chapter[];
export default chapters;
