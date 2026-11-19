import { Link, useParams } from "react-router-dom";
import { staticBlog } from "../data/staticContent";
import { formatWhen } from "../lib/content";
import "./Content.css";

export default function BlogDetail() {
  const { slug = "" } = useParams();
  const blog = staticBlog(slug);

  if (!blog) {
    return (
      <div className="page container">
        <p className="form-error">Article not found</p>
        <Link to="/blogs">← All articles</Link>
      </div>
    );
  }

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
