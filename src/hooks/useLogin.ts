import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('로그인되었습니다!');
        navigate('/dashboard');
      } else {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return {
    isLoading,
    formData,
    handleSubmit,
    handleChange,
  };
};