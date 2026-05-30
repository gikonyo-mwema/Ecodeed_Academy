/**
 * Scroll to Top Component
 * 
 * Automatically scrolls the page to the top when route changes.
 * Should be placed in the main app layout to ensure users start
 * at the top of the page when navigating between routes.
 * 
 * Features:
 * - Automatic scroll on route change
 * - Instant scroll animation
 * - Uses React Router location hook
 * - No visual rendering (invisible component)
 * 
 * Usage in App.jsx:
 * import ScrollToTop from '@/components/ScrollToTop';
 * 
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>
 *     ...
 *   </Routes>
 * </BrowserRouter>
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Auto-scroll to top on route changes
 * 
 * @returns {null} This component doesn't render anything
 */
const ScrollToTop = () => {
    const { pathname } = useLocation(); 

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

export default ScrollToTop;