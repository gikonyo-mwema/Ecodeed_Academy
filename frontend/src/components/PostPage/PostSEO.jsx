/**
 * PostSEO — Injects <head> meta tags & JSON-LD structured data for a blog post.
 *
 * Covers:
 *  - Standard meta (title, description, canonical)
 *  - Open Graph (Facebook / LinkedIn)
 *  - Twitter Card
 *  - Google BlogPosting JSON-LD (schema.org)
 *
 * @component
 */
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Ecodeed';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';
const DEFAULT_OG_IMAGE = 'https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png';
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

function getAuthorName(post) {
  const u = post?.user;
  if (!u) return 'Ecodeed';
  const first = u.firstName || u.first_name || '';
  const last = u.lastName || u.last_name || '';
  return `${first} ${last}`.trim() || u.username || 'Ecodeed';
}

export default function PostSEO({ post }) {
  if (!post) return null;

  const title = post.meta_title || post.title || 'Blog Post';
  const description = post.meta_description || post.excerpt || '';
  const canonical = post.canonical_url || `${SITE_URL}/post/${post.slug}`;
  const ogImage = post.og_image || post.image || DEFAULT_OG_IMAGE;
  const twitterImage = post.twitter_image || ogImage;
  const authorName = getAuthorName(post);
  const publishedAt = post.publishedAt || post.published_at || post.createdAt || post.created_at;
  const updatedAt = post.updatedAt || post.updated_at;

  // Schema.org BlogPosting JSON-LD — Google-recommended structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: ogImage ? [ogImage] : undefined,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: post.user?._id ? `${SITE_URL}/user/${post.user._id}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    wordCount: post.content ? post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length : undefined,
    articleSection: post.category || undefined,
  };

  return (
    <Helmet>
      {/* Basic */}
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="article:published_time" content={publishedAt} />
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      <meta property="article:author" content={authorName} />
      {post.category && <meta property="article:section" content={post.category} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
