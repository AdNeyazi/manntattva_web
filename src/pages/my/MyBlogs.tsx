import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type OwnerBlog } from "../../api";
import { statusLabel } from "../../lib/content";
import "../Content.css";

export default function MyBlogs() {
  const [items, setItems] = useState<OwnerBlog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api.myBlogs.list()
      .then((d) => setItems(d.blogs))
      .catch((err) => setError(errorMessages(err, "Could not load blogs")[0]));
  }

  useEffect(load, []);

  async function submit(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const d = await api.myBlogs.submit(id);
      setItems((list) => (list ?? []).map((x) => (x.id === id ? d.blog : x)));
    } catch (err) {
      setError(errorMessages(err, "Could not submit")[0]);
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(id: number) {
    if (!window.confirm("Delete this draft?")) return;
    setBusyId(id);
    try {
      await api.myBlogs.destroy(id);
      setItems((list) => (list ?? []).filter((x) => x.id !== id));
    } catch (err) {
      setError(errorMessages(err, "Could not delete")[0]);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Blogs</span>
        <h1>Your articles</h1>
        <p>Write privately, then submit for Manntattva admin approval. Approved posts appear on /blogs.</p>
      </header>
      <p style={{ marginBottom: 18 }}>
        <Link className="btn btn-gold" to="/my/blogs/new">New article</Link>
      </p>
      {error && <div className="form-error" role="alert">{error}</div>}
      {items === null && <p>Loading…</p>}
      {items && items.length === 0 && <p className="empty-state">No articles yet.</p>}
      {items && items.length > 0 && (
        <div className="content-list">
          {items.map((blog) => (
            <article className="content-card" key={blog.id}>
              <span className={`status-pill status-pill--${blog.status}`}>{statusLabel(blog.status)}</span>
              <h3 style={{ marginTop: 8 }}>{blog.title}</h3>
              {blog.reviewer_note && blog.status === "rejected" && (
                <p className="form-error" style={{ marginTop: 8 }}>{blog.reviewer_note}</p>
              )}
              <div className="content-actions">
                {(blog.status === "draft" || blog.status === "rejected") && (
                  <>
                    <Link className="btn btn-sm btn-indigo" to={`/my/blogs/${blog.id}`}>Edit</Link>
                    <button className="btn btn-sm btn-gold" disabled={busyId === blog.id} onClick={() => void submit(blog.id)}>
                      Submit for approval
                    </button>
                    <button className="btn btn-sm btn-line" disabled={busyId === blog.id} onClick={() => void destroy(blog.id)}>
                      Delete
                    </button>
                  </>
                )}
                {blog.status === "published" && (
                  <Link className="card-link" to={`/blogs/${blog.slug}`}>View live →</Link>
                )}
                {blog.status === "pending" && <span className="fine">Waiting for admin review.</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
