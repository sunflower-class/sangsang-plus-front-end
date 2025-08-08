import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Agreements = {
  terms: boolean;
  marketing: boolean;
};

type Errors = Partial<Record<keyof FormData | keyof Agreements, string>> & { form?: string };

export const useSignup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const newErrors: Errors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = '비밀번호는 8자 이상, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!agreements.terms) {
      newErrors.terms = '필수 약관에 동의해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const success = await signup(formData.email, formData.password, formData.name);
      if (success) {
        toast.success('회원가입이 완료되었습니다!');
        navigate('/dashboard');
      } else {
        setErrors({ email: '이미 사용 중인 이메일이거나 회원가입에 실패했습니다.' });
      }
    } catch (error) {
      setErrors({ form: '회원가입 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof Errors];
        return newErrors;
      });
    }
  };

  const handleAgreementChange = (e: { target: { name: string; checked: boolean } }) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({ ...prev, [name]: checked }));
    if (name === 'terms' && errors.terms) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  const handleAllAgreementChange = (e: { target: { checked: boolean } }) => {
    const { checked } = e.target;
    setAgreements({
      terms: checked,
      marketing: checked,
    });
    if (errors.terms) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const allChecked = agreements.terms && agreements.marketing;
    const allAgreementCheckbox = document.getElementById('all-agreements') as HTMLInputElement;
    if (allAgreementCheckbox && allAgreementCheckbox.checked !== allChecked) {
      allAgreementCheckbox.checked = allChecked;
    }
  }, [agreements]);

  return {
    isLoading,
    formData,
    agreements,
    errors,
    handleSubmit,
    handleChange,
    handleAgreementChange,
    handleAllAgreementChange,
  };
};