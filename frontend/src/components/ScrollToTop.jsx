/**
 * ScrollToTop Component — Auto-scroll to top on route change.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Automatically scrolls the page to top (0, 0) when route pathname changes.
 * Improves UX for multi-page apps where users expect to see page top after navigation.
 * Common pattern in single-page apps (e.g., React Router projects).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. Pathname-triggered scroll — Monitors useLocation().pathname
 * 2. Instant scroll — window.scrollTo(0, 0) for immediate top jump
 * 3. Non-rendering — Returns null (no DOM output)
 * 4. No props — Completely standalone, works globally in <Routes> wrapper
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Place once near top-level route component:
 *
 *   function App() {
 *     return (
 *       <BrowserRouter>
 *         <ScrollToTop />  (place here in the component tree)
 *         <Routes>
 *           <Route path="/" element={<Home />} />
 *           <Route path="/blog/:slug" element={<PostPage />} />
 *         </Routes>
 *       </BrowserRouter>
 *     );
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TECHNICAL NOTES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * - Must be a child of BrowserRouter/Router component to access useLocation hook
 * - Triggers on ANY pathname change, not just initial page load
 * - Useful for long-form pages (blog, documentation) where scroll position
 *   from previous page shouldn't persist
 * - Not needed for single-page SPAs with in-page navigation only
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE & DEPENDENCIES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Dependencies:
 *   - useLocation().pathname — Triggers effect on change
 *
 * Side Effects:
 *   - window.scrollTo(0, 0) — Immediate scroll top
 *
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation(); 

    useEffect(() => {
        window.scrollTo(0, 0);

        const focusMain = window.requestAnimationFrame(() => {
            const mainContent = document.getElementById('main-content');
            if (mainContent instanceof HTMLElement) {
                mainContent.focus();
            }
        });

        return () => window.cancelAnimationFrame(focusMain);
    }, [pathname]);
    return null;
}

export default ScrollToTop;