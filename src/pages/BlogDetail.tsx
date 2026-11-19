import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessages, type PublicBlog } from "../api";
import { formatWhen } from "../lib/content";
import "./Content.css";

export default function BlogDetail() {
  const { slug = "" } = useParams();
  const [blog, setBlog] = useState<PublicBlog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.blogs.get(slug)
      .then((d) => setBlog(d.blog))
      .catch((err) => setError(errorMessages(err, "Article not found")[0]));
  }, [slug]);

  if (error) {
    return (
      <div className="page container">
        <p className="form-error">{error}</p>
        <Link to="/blogs">← All articles</Link>
      </div>
    );
  }
  if (!blog) return <p className="center-note">Loading…</p>;

  return (
    <div className="page container narrow">
      <Link className="back-link" to="/blogs">← All articles</Link>
      <h1>{blog.title}</h1>
      <p className="content-meta">
        By <Link to={`/counsellors/${blog.author.slug}`}>{blog.author.full_name}</Link>
        {blog.published_at ? ` · ${formatWhen(blog.published_at)}` : ""}
      </p>
      {blog.cover_image_url && (
        <img className="blog-detail-cover" src={blog.cover_image_url} alt="" />
      )}
      <div className="prose-block" dangerouslySetInnerHTML={{ __html: blog.body }} />
    </div>
  );
}
