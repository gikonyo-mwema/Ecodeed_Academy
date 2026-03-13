/**
 * Service Payload Sanitizer — Normalizes and validates service data before API submission.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Cleans and normalizes service payload objects before sending to backend API.
 * Handles string trimming, empty array/field filtering, URL formatting, and
 * field name normalization. Ensures data consistency across form inputs.\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SANITIZATION OPERATIONS\n * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. String Trimming: Remove leading/trailing whitespace from all string fields
 * 2. Empty Array Filtering: Remove empty strings and falsy values from arrays
 * 3. URL Normalization: Prepend 'https://' to URLs missing protocol
 * 4. Field Normalization: Map 'fullDescription' → 'description' for consistency
 * 5. Step Mapping: Normalize 'step' → 'title' in processSteps array\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PAYLOAD STRUCTURE\n * ═══════════════════════════════════════════════════════════════════════════════════
 * Expected input/output structure:
 * {
 *   title: string,
 *   description: string,  // or fullDescription (normalized to description)
 *   projectTypes: string[],
 *   tags: string[],
 *   benefits: { title, description }[],
 *   features: { title, description }[],
 *   socialLinks: { platform, url }[],  // URLs auto-formatted with https://
 *   processSteps: { title, description, order }[]
 * }\n *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * import { sanitizeServicePayload } from '@/utils/serviceSanitizer';\n * const formData = { title: '  Service  ', tags: ['', 'tag1', ''], url: 'example.com' };
 * const clean = sanitizeServicePayload(formData);
 * // Result: { title: 'Service', tags: ['tag1'], url: 'https://example.com' }\n *
 * @module ServiceSanitizer
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

// Normalizes and sanitizes service payloads before sending to the API
export function sanitizeServicePayload(payload) {
  // Always keep a copy to avoid mutating caller unexpectedly
  payload = { ...payload };

  // Trim all string fields
  for (const key in payload) {
    if (typeof payload[key] === 'string') {
      payload[key] = payload[key].trim();
    }
  }

  // Filter out empty arrays and empty string elements
  if (Array.isArray(payload.projectTypes)) {
    payload.projectTypes = payload.projectTypes.filter(type => type && type.trim());
  }
  if (Array.isArray(payload.tags)) {
    payload.tags = payload.tags.filter(tag => tag && tag.trim());
  }
  if (Array.isArray(payload.benefits)) {
    payload.benefits = payload.benefits.filter(benefit => benefit && (benefit.title || benefit.description));
  }
  if (Array.isArray(payload.features)) {
    payload.features = payload.features.filter(feature => feature && (feature.title || feature.description));
  }
  if (Array.isArray(payload.socialLinks)) {
    const ensureHttp = (url) => {
      if (!url || typeof url !== 'string') return url;
      const trimmed = url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };
    payload.socialLinks = payload.socialLinks
      .filter(link => link && link.platform && link.url)
      .map(link => ({ ...link, url: ensureHttp(link.url) }));
  }
  if (Array.isArray(payload.processSteps)) {
    // Map step -> title for consistency
    payload.processSteps = payload.processSteps
      .filter(step => step && (step.title || step.step || step.description))
      .map(step => ({
        title: step.title || step.step || '',
        description: step.description || '',
        order: step.order || 0
      }));
  }

  // Normalize description vs fullDescription (backend accepts either, prefers description)
  if (!payload.description && payload.fullDescription) {
    payload.description = payload.fullDescription;
    delete payload.fullDescription;
  }

  return payload;
}
