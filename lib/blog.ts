import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog-posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  readTime: string;
  content: string;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        author: data.author,
        readTime: data.readTime,
        content,
      } as BlogPost;
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      author: data.author,
      readTime: data.readTime,
      content,
    } as BlogPost;
  } catch (error) {
    return null;
  }
}
