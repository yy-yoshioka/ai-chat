export interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
  readingTime: string;
  content: string;
}

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
}
