import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessages, type BlogInput } from "../../api";
import "../Content.css";

const EMPTY: BlogInput = { title: "", excerpt: "", body: "" };
const BlogBodyEditor = lazy(() => import("../../components/BlogBodyEditor"));

export default function MyBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState<BlogInput>(EMPTY);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [articleLoaded, setArticleLoaded] = useState(!id);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.myBlogs.get(Number(id))
      .then((d) => {
        setForm({ title: d.blog.title, excerpt: d.blog.excerpt ?? "", body: d.blog.body });
        setCurrentCoverUrl(d.blog.cover_image_url);
        setArticleLoaded(true);
      })
      .catch((err) => setErrors(errorMessages(err, "Could not load article")));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!new DOMParser().parseFromString(form.body, "text/html").body.textContent?.trim()) {
      setErrors(["Article body is required."]);
      return;
    }

    setBusy(true);
    setErrors([]);
    try {
      const values = { ...form, ...(coverImage ? { cover_image: coverImage } : {}) };
      if (editing && id) await api.myBlogs.update(Number(id), values);
      else await api.myBlogs.create(values);
      navigate("/my/blogs");
    } catch (err) {
      setErrors(errorMessages(err, "Could not save article"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Blogs</span>
        <h1>{editing ? "Edit article" : "New article"}</h1>
        <p>Save as a draft, then submit it from the list for admin approval.</p>
      </header>
      <form className="card form form-wide" onSubmit={onSubmit}>
        {errors.length > 0 && <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>}
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Short excerpt<textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
        <fieldset className="blog-cover-field">
          <legend>Cover image</legend>
          {currentCoverUrl && !coverImage && (
            <img className="blog-cover-preview" src={currentCoverUrl} alt="Current blog cover" />
          )}
          <label>
            {coverImage ? `Selected: ${coverImage.name}` : currentCoverUrl ? "Choose a new cover image" : "Choose a cover image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!editing && !currentCoverUrl}
              disabled={busy}
              onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            />
          </label>
          <span className="fine">JPEG, PNG, or WebP, up to 8 MB. Required for new articles.</span>
        </fieldset>
        <div className="blog-editor">
          <label>Article body</label>
          {articleLoaded ? (
            <Suspense fallback={<div className="fine">Loading editor…</div>}>
              <BlogBodyEditor
                data={form.body}
                disabled={busy}
                onChange={(body) => setForm((current) => ({ ...current, body }))}
              />
            </Suspense>
          ) : <div className="fine">Loading article…</div>}
        </div>
        <div className="content-actions">
          <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button>
          <Link className="btn btn-line" to="/my/blogs">Cancel</Link>
        </div>
      </form>
    </>
  );
}
