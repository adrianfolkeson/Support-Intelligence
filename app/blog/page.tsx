import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getAllBlogPosts } from "@/lib/blog";

export const dynamic = 'force-static';

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Support Intelligence Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert insights on churn prevention, customer success, and building SaaS that retains.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                  <CardContent className="p-6">
                    {/* Post Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  Ready to Reduce Your Churn?
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
