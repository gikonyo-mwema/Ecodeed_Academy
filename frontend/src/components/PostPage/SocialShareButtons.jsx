/**
 * SocialShareButtons — Functional social sharing + copy-link.
 *
 * Each button opens the platform's share intent URL.
 * Includes a "copied!" tooltip on the copy-link button.
 *
 * @component
 */
import { useState, useCallback } from 'react';
import { Tooltip } from 'flowbite-react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaPinterest, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

function shareUrl(platform, { url, title, description, image }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  const urls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}&media=${encodeURIComponent(image || '')}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  return urls[platform] || '#';
}

function ShareButton({ platform, icon: Icon, label, hoverColor, url, title, description, image }) {
  const handleClick = useCallback(() => {
    const href = shareUrl(platform, { url, title, description, image });
    window.open(href, `share-${platform}`, 'width=600,height=400,menubar=no,toolbar=no');
  }, [platform, url, title, description, image]);

  return (
    <Tooltip content={`Share on ${label}`}>
      <button
        onClick={handleClick}
        className={`p-2 rounded-full text-gray-500 dark:text-gray-400 transition-colors ${hoverColor}`}
        aria-label={`Share on ${label}`}
      >
        <Icon size={18} />
      </button>
    </Tooltip>
  );
}

export default function SocialShareButtons({ post }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const title = post?.title || '';
  const description = post?.excerpt || post?.meta_description || '';
  const image = post?.og_image || post?.image || '';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentUrl]);

  const shareProps = { url: currentUrl, title, description, image };

  return (
    <div className="flex items-center gap-1">
      <Tooltip content={copied ? 'Copied!' : 'Copy link'}>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-full transition-colors ${
            copied
              ? 'text-green-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
          }`}
          aria-label="Copy link to clipboard"
        >
          {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
        </button>
      </Tooltip>

      <ShareButton
        platform="twitter"
        icon={FaTwitter}
        label="Twitter"
        hoverColor="hover:text-sky-500"
        {...shareProps}
      />
      <ShareButton
        platform="facebook"
        icon={FaFacebook}
        label="Facebook"
        hoverColor="hover:text-blue-700"
        {...shareProps}
      />
      <ShareButton
        platform="linkedin"
        icon={FaLinkedin}
        label="LinkedIn"
        hoverColor="hover:text-blue-600"
        {...shareProps}
      />
      <ShareButton
        platform="pinterest"
        icon={FaPinterest}
        label="Pinterest"
        hoverColor="hover:text-red-600"
        {...shareProps}
      />
      <ShareButton
        platform="whatsapp"
        icon={FaWhatsapp}
        label="WhatsApp"
        hoverColor="hover:text-green-500"
        {...shareProps}
      />
    </div>
  );
}
