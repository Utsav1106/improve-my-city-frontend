import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { issuesAPI } from '../api/issues';
import type { IssueCategory } from '../types';
import { Input, TextArea } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const categories: IssueCategory[] = [
  'Pothole',
  'Garbage',
  'Streetlight',
  'Water Supply',
  'Drainage',
  'Road Damage',
  'Parks',
  'Other',
];

export function ReportIssuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole' as IssueCategory,
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    address: '',
    latitude: 40.7128,
    longitude: -74.0060,
    photoUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) return;

    setIsSubmitting(true);

    try {
      const photos = formData.photoUrl ? [formData.photoUrl] : [
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'
      ];

      await issuesAPI.createIssue(
        formData.title,
        formData.description,
        formData.category,
        formData.priority,
        {
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        photos,
        user.id,
        user.name
      );

      navigate('/my-issues');
    } catch (error) {
      console.error('Failed to create issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter it manually.');
        }
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Civic Issue</h1>
        <p className="text-gray-600">Help improve your community by reporting issues that need attention</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Issue Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Brief description of the issue"
            error={errors.title}
            required
          />

          <TextArea
            label="Detailed Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Provide more details about the issue..."
            rows={5}
            error={errors.description}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="flex gap-2">
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter address or location"
                error={errors.address}
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={useCurrentLocation}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use GPS
              </Button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </p>
          </div>

          <Input
            label="Photo URL (Optional)"
            value={formData.photoUrl}
            onChange={(e) => handleChange('photoUrl', e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />

          {formData.photoUrl && (
            <div className="mt-2">
              <img
                src={formData.photoUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800';
                }}
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Tips for Effective Reporting:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific and descriptive in your title</li>
              <li>• Include as many details as possible</li>
              <li>• Provide accurate location information</li>
              <li>• Add photos if available for better context</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Submit Report
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
