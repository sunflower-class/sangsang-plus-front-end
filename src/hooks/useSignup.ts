import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import userService from '@/apis/userService';

export const useSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    marketing: false,
  });

  const validateEmail = (email: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreements.terms) {
      toast.error('필수 약관에 동의해주세요.');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('비밀번호는 8자 이상, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await userService.signUp({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        // agreeToMarketing: agreements.marketing, // 백엔드에 해당 필드가 추가될 때까지 주석 처리
      });
      toast.success('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다.');
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

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({ ...prev, [name]: checked }));
  };

  const handleAllAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setAgreements({
      terms: checked,
      marketing: checked,
    });
  };

  useEffect(() => {
    const allChecked = agreements.terms && agreements.marketing;
    const allAgreementCheckbox = document.getElementById('all-agreements') as HTMLInputElement;
    if (allAgreementCheckbox && allAgreementCheckbox.checked !== allChecked) {
      // This is a bit of a hack, ideally we'd have a better way to sync this
      // without relying on the DOM. But for now, it works.
      allAgreementCheckbox.checked = allChecked;
    }
  }, [agreements]);


  return {
    isLoading,
    formData,
    agreements,
    handleSubmit,
    handleChange,
    handleAgreementChange,
    handleAllAgreementChange,
  };
};