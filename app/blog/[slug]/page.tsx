import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-white">
        <article>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
              <Link
                href="/blog"
                className="inline-flex items-center text-blue-100 hover:text-white mb-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>

              <h1 className="text-4xl font-bold sm:text-5xl mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{post.author}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-4 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">{children}</h4>,
                  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-600 hover:text-blue-700 underline font-medium">
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-600 pl-4 py-2 my-6 italic text-gray-700 bg-gray-50">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                  hr: () => <hr className="border-gray-200 my-8" />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {prevPost && (
                <Link href={`/blog/${prevPost.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{prevPost.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{prevPost.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer md:text-right">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 md:justify-end">
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{nextPost.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{nextPost.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-200">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Ready to Take Action?
                </h2>
                <p className="text-blue-100 mb-6">
                  Start your 30-day free trial and see which customers are at risk.
                </p>
                <Link href="/pricing">
                  <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium">
                    Start Free Trial
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
