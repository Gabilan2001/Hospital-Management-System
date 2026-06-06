import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import api from '../../api/axiosInstance';
import { updateUserProfile } from '../../features/auth/authSlice';
import Avatar from './Avatar';

const AvatarUpload = ({
  src,
  name,
  size = 'xl',
  userId,
  patientId,
  type = 'user',
  onUploaded,
  disabled = false,
  syncAuth = false,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(src || '');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      let endpoint = '/upload/avatar/user/me';
      if (patientId) {
        endpoint = `/upload/patient/${patientId}/photo`;
      } else if (userId) {
        endpoint = `/upload/avatar/user/${userId}`;
      }

      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = data.data.url || data.data.user?.avatar || data.data.patient?.photo;
      setPreview(url);
      if (syncAuth) dispatch(updateUserProfile({ avatar: url }));
      toast.success('Photo updated');
      onUploaded?.(url, data.data);
    } catch (err) {
      setPreview(src || '');
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block group">
      <Avatar src={preview} name={name} size={size} />
      {!disabled && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            {uploading ? (
              <Loader2 size={24} className="text-white animate-spin" />
            ) : (
              <Camera size={24} className="text-white" />
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  );
};

export default AvatarUpload;
