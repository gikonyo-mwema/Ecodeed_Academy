
    // Fetch courses on mount if admin
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
