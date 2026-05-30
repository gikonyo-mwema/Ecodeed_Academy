/**
 * Video embed helpers for lesson players.
 * Supports YouTube, Vimeo, Facebook, and TikTok URLs.
 */

const safeUrl = (value) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const extractYouTubeId = (urlString) => {
  const url = safeUrl(urlString);
  if (!url) return null;

  const host = url.hostname.replace('www.', '');
  if (host === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] || null;
  }

  if (host.includes('youtube.com')) {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null;
  }

  return null;
};

const extractVimeoId = (urlString) => {
  const url = safeUrl(urlString);
  if (!url) return null;

  const host = url.hostname.replace('www.', '');
  if (!host.includes('vimeo.com')) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  if (!parts.length) return null;

  // Handles /12345678 and /channels/staffpicks/12345678
  return [...parts].reverse().find((p) => /^\d+$/.test(p)) || null;
};

const extractTikTokId = (urlString) => {
  const url = safeUrl(urlString);
  if (!url) return null;

  const host = url.hostname.replace('www.', '');
  if (!host.includes('tiktok.com')) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  // /@user/video/1234567890
  const videoIndex = parts.findIndex((p) => p === 'video');
  if (videoIndex >= 0 && parts[videoIndex + 1]) {
    return parts[videoIndex + 1];
  }
  // /embed/v2/1234567890
  const embedIndex = parts.findIndex((p) => p === 'v2');
  if (embedIndex >= 0 && parts[embedIndex + 1]) {
    return parts[embedIndex + 1];
  }

  return null;
};

export const getVideoProvider = (urlString) => {
  const url = safeUrl(urlString);
  if (!url) return 'unknown';

  const host = url.hostname.replace('www.', '');
  if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
  if (host.includes('vimeo.com')) return 'vimeo';
  if (host.includes('facebook.com') || host.includes('fb.watch')) return 'facebook';
  if (host.includes('tiktok.com')) return 'tiktok';
  return 'other';
};

/**
 * Returns a URL that ReactPlayer can reliably play where possible.
 */
export const getPlayableVideoUrl = (urlString) => {
  if (!urlString) return null;

  const provider = getVideoProvider(urlString);

  if (provider === 'youtube') {
    const id = extractYouTubeId(urlString);
    return id ? `https://www.youtube.com/watch?v=${id}` : urlString;
  }

  if (provider === 'vimeo') {
    const id = extractVimeoId(urlString);
    return id ? `https://vimeo.com/${id}` : urlString;
  }

  // ReactPlayer may support these depending on version; keep raw URL first.
  if (provider === 'facebook' || provider === 'tiktok') {
    return urlString;
  }

  return urlString;
};

/**
 * Returns provider embed iframe URL for fallback when ReactPlayer cannot play.
 */
export const getEmbedFallbackUrl = (urlString) => {
  if (!urlString) return null;

  const provider = getVideoProvider(urlString);

  if (provider === 'youtube') {
    const id = extractYouTubeId(urlString);
    return id
      ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
      : null;
  }

  if (provider === 'vimeo') {
    const id = extractVimeoId(urlString);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (provider === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(urlString)}&show_text=false&width=1280`;
  }

  if (provider === 'tiktok') {
    const id = extractTikTokId(urlString);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }

  return null;
};
