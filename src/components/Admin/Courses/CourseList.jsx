/**
 * Course List Component
 * 
 * Displays a paginated list of all available courses in the admin interface.
 * Handles fetching, loading states, and pagination for course management.
 * 
 * Features:
 * - Fetch all courses from API
 * - Pagination with "Load More" functionality
 * - Loading state indicators
 * - Admin-only access
 * - Responsive course grid display
 * - Show/hide "Load More" button based on results
 * 
 * State Management:
 * - courses: Array of course objects
 * - loading: Loading state indicator
 * - showMore: Toggle for load more button visibility
 * - currentUser: Redux user state for auth check
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses || data);
          if ((data.courses || data).length < 9) setShowMore(false);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.isAdmin) fetchCourses();
  }, [currentUser]);
  
  // Load more courses for pagination
  const handleShowMore = async () => {
    const startIndex = courses.length;
    try {
      const res = await fetch(`/api/courses?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => [...prev, ...(data.courses || data)]);
        if ((data.courses || data).length < 9) setShowMore(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
