import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { STATIC_BLOGS } from "../data/staticContent";
import "./Content.css";

const PUBLISHED_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function BlogCover({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="blog-card__cover" aria-hidden="true">
      {imageUrl ? (
        <img className="blog-card__image" src={imageUrl} alt="" loading="lazy" />
      ) : (
        <>
          <svg viewBox="0 0 640 360" focusable="false">
            <circle className="blog-card__sun" cx="464" cy="106" r="72" />
            <path className="blog-card__landscape blog-card__landscape--back" d="M0 278 148 154l124 100 117-111 251 177v40H0z" />
            <path className="blog-card__landscape blog-card__landscape--front" d="m0 282 139-57 122 73 123-72 256 77v57H0z" />
            <path className="blog-card__stem" d="M321 296c4-62-4-123-34-174m36 120c17-44 42-69 83-94m-92 111c-24-36-49-55-83-70" />
            <path className="blog-card__leaf" d="M287 139c-2 28 8 43 31 51 3-25-7-42-31-51Zm119 1c-25 7-39 22-41 47 25-6 39-22 41-47Zm-154 69c5 24 20 38 44 39-5-24-20-37-44-39Z" />
            <circle className="blog-card__spark" cx="145" cy="104" r="5" />
            <circle className="blog-card__spark" cx="205" cy="72" r="3" />
            <circle className="blog-card__spark" cx="536" cy="208" r="4" />
          </svg>
          <span className="blog-card__cover-label">A little space to reflect</span>
        </>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Blogs() {
  const items = STATIC_BLOGS;

  return (
    <div className="page container blogs-page">
      <header className="page-head page-head--center">
        <span className="eyebrow eyebrow--light">Insights</span>
        <h1>Thoughts for a more mindful life</h1>
        <p>Reflections and practical guidance from Manntattva counsellors, thoughtfully reviewed by our team.</p>
      </header>
      {items.length === 0 && <p className="empty-state">No published articles yet.</p>}
      {items.length > 0 && (
        <div className="blog-card-grid">
          {items.map((blog, index) => (
            <Link
              className="content-card content-card--blog"
              key={blog.id}
              to={`/blogs/${blog.slug}`}
              style={{ "--card-index": index } as CSSProperties}
            >
              <BlogCover imageUrl={blog.cover_image_url} />
              <div className="blog-card__body">
                <div className="blog-card__date">
                  {blog.published_at ? PUBLISHED_DATE.format(new Date(blog.published_at)) : "Manntattva insights"}
                </div>
                <h2>{blog.title}</h2>
                <p className="blog-card__excerpt">{blog.excerpt}</p>
                <div className="blog-card__footer">
                  <span className="blog-card__author">
                    {blog.author.photo_url ? (
                      <img src={blog.author.photo_url} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-card__initials" aria-hidden="true">{initials(blog.author.full_name)}</span>
                    )}
                    <span className="blog-card__author-name">
                      <span>{blog.author.full_name}</span>
                      {blog.author.is_verified && <span className="blog-card__verified">Verified counsellor</span>}
                    </span>
                  </span>
                  <span className="blog-card__read-more">
                    Read more <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
