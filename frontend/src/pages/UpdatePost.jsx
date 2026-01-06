import { Alert, Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PostEditor from "../components/Admin/Posts/PostForm/PostEditor";
import { apiFetch } from '../utils/api';

export default function UpdatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'uncategorized'
  });
  const [publishError, setPublishError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch(`/api/posts/getPosts?postId=${postId}`);
        
        if (data.posts.length > 0) {
          const post = data.posts[0];
          setFormData({
            title: post.title,
            content: post.content,
            category: post.category
          });
        }
      } catch (error) {
        setPublishError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.content.trim() || formData.content === '<p><br></p>') {
        throw new Error('Content is required');
      }

      setIsLoading(true);
      const data = await apiFetch(
        `/api/post/updatePost/${postId}/${currentUser._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'uncategorized', label: '🌍 Select a category' },
    { value: 'climate-change', label: '🔥 Climate Change' },
    { value: 'renewable-energy', label: '☀️ Renewable Energy' },
    { value: 'sustainable-agriculture', label: '🌱 Sustainable Agriculture' },
    { value: 'conservation', label: '🐘 Wildlife Conservation' },
    { value: 'zero-waste', label: '♻️ Zero Waste' },
    { value: 'ocean-preservation', label: '🌊 Ocean Health' },
    { value: 'green-tech', label: '💡 Green Tech' },
    { value: 'environmental-policy', label: '📜 Eco Policy' },
    { value: 'sustainable-cities', label: '🏙️ Sustainable Cities' },
    { value: 'eco-tourism', label: '✈️ Responsible Travel' }
  ];

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update Post</h1>
      
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            value={formData.title}
            onChange={(e) => 
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category}
            onChange={(e) => 
              setFormData({ ...formData, category: e.target.value })
            }
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        <PostEditor
          content={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          currentUser={currentUser}
        />

        <Button
          type='submit'
          gradientDuoTone='purpleToPink'
          disabled={isLoading}
          isProcessing={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Post'}
        </Button>

        {publishError && (
          <Alert color='failure' className='mt-4'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
