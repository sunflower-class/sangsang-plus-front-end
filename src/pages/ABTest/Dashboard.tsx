import React, { useState, useEffect, FC, FormEvent } from 'react';
import styles from './Dashboard.module.css'; // CSS 모듈로 import

// =================================================================
// 타입 정의 (Type Definitions)
// =================================================================
interface Test {
  id: number;
  name: string;
  product_id: string;
  created_at: string;
  status: 'active' | 'completed' | 'waiting_for_winner_selection';
}

interface VariantAnalysis {
  variant_id: number;
  variant_name: string;
  ai_score: number;
  ai_confidence: number;
  confidence_details: {
    calculation_method: string;
    sample_size: number;
    conversion_rate?: number;
    std_error?: number;
    margin_of_error?: number;
    base_confidence?: number;
    variability_factor?: number;
    final_confidence?: number;
    formula: string;
    linear_confidence?: number;
  };
  cvr: number;
  cart_add_rate: number;
  cart_conversion_rate: number;

  error_rate: number;
  avg_page_load_time: number;
  clicks: number;
  cart_additions: number;
  purchases: number;
  revenue: number;
}

interface AIAnalysis {
  ai_weights: Record<string, number>;
  variant_analysis: VariantAnalysis[];
}



const API_BASE_URL = 'http://localhost:8000/api/abtest';

const Dashboard: FC = () => {
    const [currentTestId, setCurrentTestId] = useState<number | null>(null);
    const [currentTests, setCurrentTests] = useState<Test[]>([]);

    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [view, setView] = useState<'all' | 'create' | 'analysis'>('all');



    const loadData = () => {
        fetch(`${API_BASE_URL}/list`).then(res => res.json()).then(data => setCurrentTests(data.tests || [])).catch(console.error);

    };
    


    useEffect(() => {
        loadData();
        console.log('load data...')
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentTestId) {
            fetch(`${API_BASE_URL}/test/${currentTestId}/ai-analysis`).then(res => res.json()).then(setAiAnalysis).catch(console.error);
        } else {
            setAiAnalysis(null);
        }
    }, [currentTestId]);

    const handleCreateTest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const testData = { name: formData.get('testName'), product_id: formData.get('productId'), product_price: Number(formData.get('productPrice')), baseline_image_url: formData.get('baselineImageUrl'), challenger_image_url: formData.get('challengerImageUrl'), test_duration_days: Number(formData.get('testDuration')), min_sample_size: Number(formData.get('minSampleSize')) };
        try {
            const res = await fetch(`${API_BASE_URL}/with-images`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testData) });
            if (res.ok) { alert('테스트 생성 성공!'); loadData(); } else { const err = await res.json(); alert(`에러: ${err.detail}`); }
        } catch (error) { alert('네트워크 오류가 발생했습니다.'); }
    };

    const handleDeleteTest = async (testId: number, testName: string) => {
        if (!confirm(`정말로 "${testName}" 테스트를 삭제하시겠습니까?`)) {
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/${testId}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.ok) {
                alert('테스트가 성공적으로 삭제되었습니다.');
                loadData();
                // 현재 선택된 테스트가 삭제된 테스트라면 선택 해제
                if (currentTestId === testId) {
                    setCurrentTestId(null);
                }
            } else {
                const err = await res.json();
                alert(`삭제 실패: ${err.detail}`);
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };


    
    const getStatusClass = (status: Test['status']) => {
        const map = { active: styles.statusActive, completed: styles.statusCompleted, waiting_for_winner_selection: styles.statusWaiting };
        return map[status] || '';
    };

    return (
        <div className={styles.container}>
            <header>
                <h1>AI 기반 A/B 테스트 자동화 플랫폼</h1>
                <p>실시간 테스트 현황 및 성과 분석</p>
                <div className={styles.navigationButtons}>
                     <button onClick={() => setView('all')} className={`${styles.navBtn} ${view === 'all' ? styles.active : ''}`}>전체 보기</button>
                     <button onClick={() => setView('create')} className={`${styles.navBtn} ${view === 'create' ? styles.active : ''}`}>새 테스트</button>
                     <button onClick={() => setView('analysis')} className={`${styles.navBtn} ${view === 'analysis' ? styles.active : ''}`}>AI 분석</button>
                     <button onClick={() => window.open('/abtest/manage', '_blank')} className={styles.navBtn}>시뮬레이터</button>
                     <button onClick={() => window.open('/abtest/winner', '_blank')} className={styles.navBtn}>승자 선택</button>
                     <button onClick={loadData} className={styles.navBtn} style={{background: '#667eea', color: 'white'}}>새로고침</button>
                </div>
            </header>

            <div className={styles.dashboardGrid}>
                {(view === 'all' || view === 'create') && (
                    <div className={styles.card}>
                        <h2>이미지 기반 A/B 테스트 생성</h2>
                        <form onSubmit={handleCreateTest}>
                            <div className={styles.formGroup}><label htmlFor="testName">테스트 이름:</label><input type="text" id="testName" name="testName" placeholder="테스트 이름을 입력하세요" required /></div>
                            <div className={styles.formGroup}><label htmlFor="productId">상품 ID:</label><input type="text" id="productId" name="productId" placeholder="PROD_001" required /></div>
                            <div className={styles.formGroup}><label htmlFor="productPrice">상품 가격 (₩):</label><input type="number" id="productPrice" name="productPrice" placeholder="1200000" min="1" required /></div>
                            <div className={styles.formGroup}><label htmlFor="baselineImageUrl">A안 이미지 URL:</label><input type="url" id="baselineImageUrl" name="baselineImageUrl" placeholder="https://example.com/a-image.jpg" required /></div>
                            <div className={styles.formGroup}><label htmlFor="challengerImageUrl">B안 이미지 URL:</label><input type="url" id="challengerImageUrl" name="challengerImageUrl" placeholder="https://example.com/b-image.jpg" required /></div>
                            <div className={styles.formGroup}><label htmlFor="testDuration">테스트 기간 (일):</label><input type="number" id="testDuration" name="testDuration" defaultValue="7" min="1" max="30" /></div>
                            <div className={styles.formGroup}><label htmlFor="minSampleSize">최소 샘플 크기:</label><input type="number" id="minSampleSize" name="minSampleSize" defaultValue="100" min="10" max="10000" /></div>
                            <button type="submit" className={styles.btnPrimary}>A/B 테스트 시작</button>
                        </form>
                    </div>
                )}
                
                 {(view === 'all' || view === 'analysis') && (
                    <div className={styles.card}>
                        <h2>현재 테스트 현황</h2>
                        <div id="currentTests">
                            {currentTests.length > 0 ? currentTests.map(test => (
                                <div key={test.id} className={styles.testCard}>
                                    <h3>{test.name} <span className={`${styles.testStatus} ${getStatusClass(test.status)}`}>{test.status}</span></h3>
                                    <div className={styles.testCardButtons}>
                                        <button onClick={() => setCurrentTestId(test.id)} className={styles.btnAnalysis}>분석 보기</button>
                                        <button 
                                            onClick={() => window.open(`/abtest/winner?testId=${test.id.toString()}`, '_blank')}
                                            className={styles.btnAnalysis}
                                            style={{background: '#8b5cf6'}}
                                        >
                                            승자 선택
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTest(test.id, test.name)}
                                            className={styles.btnDelete}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            )) : <p>진행중인 테스트가 없습니다.</p>}
                        </div>
                    </div>
                 )}

                 {(view === 'all' || view === 'analysis') && currentTestId && (
                     <div className={styles.card}>
                        <h2>AI 분석 결과 (Test ID: {currentTestId})</h2>
                        {aiAnalysis ? (
                            <div>
                                {/* AI 가중치 섹션 */}
                                <div className={styles.aiWeightsSection}>
                                    <h3>AI 가중치</h3>
                                    <div className={styles.weightsGrid}>
                                        {Object.entries(aiAnalysis.ai_weights).map(([key, value]) => (
                                            <div key={key} className={styles.weightItem}>
                                                <span className={styles.weightLabel}>{key.toUpperCase()}</span>
                                                <span className={styles.weightValue}>{(value * 100).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 각 버전 분석 결과 */}
                                {aiAnalysis.variant_analysis.map(v => (
                                    <div key={v.variant_id} className={styles.variantAnalysisSection}>
                                        <h3>{v.variant_name}</h3>
                                        <div className={styles.metricsGrid}>
                                            {/* 이미지와 동일한 7개 지표 */}
                                            <div className={`${styles.metricCard} ${styles.aiScore}`}>
                                                <span className={styles.metricLabel}>AI 점수</span>
                                                <span className={styles.metricValue}>{v.ai_score.toFixed(3)}</span>
                                            </div>
                                            <div className={`${styles.metricCard} ${styles.confidence}`}>
                                                <span className={styles.metricLabel}>신뢰도</span>
                                                <span className={styles.metricValue}>{(v.ai_confidence * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className={styles.metricCard}>
                                                <span className={styles.metricLabel}>CVR</span>
                                                <span className={styles.metricValue}>{(v.cvr * 100).toFixed(2)}%</span>
                                            </div>
                                            <div className={styles.metricCard}>
                                                <span className={styles.metricLabel}>장바구니 추가율</span>
                                                <span className={styles.metricValue}>{(v.cart_add_rate * 100).toFixed(2)}%</span>
                                            </div>
                                            <div className={styles.metricCard}>
                                                <span className={styles.metricLabel}>장바구니 전환율</span>
                                                <span className={styles.metricValue}>{(v.cart_conversion_rate * 100).toFixed(2)}%</span>
                                            </div>
                                            <div className={styles.metricCard}>
                                                <span className={styles.metricLabel}>매출</span>
                                                <span className={styles.metricValue}>₩{v.revenue.toLocaleString()}</span>
                                            </div>
                                            <div className={styles.metricCard}>
                                                <span className={styles.metricLabel}>클릭수</span>
                                                <span className={styles.metricValue}>{v.clicks}</span>
                                            </div>
                                        </div>

                                        {/* 신뢰도 계산 세부사항 */}
                                        <div className={styles.confidenceDetails}>
                                            <h4>신뢰도 계산 세부사항</h4>
                                            <div className={styles.confidenceInfo}>
                                                <p><strong>계산 방법:</strong> {v.confidence_details.calculation_method}</p>
                                                <p><strong>샘플 크기:</strong> {v.confidence_details.sample_size}</p>
                                                {v.confidence_details.conversion_rate && (
                                                    <p><strong>전환율:</strong> {v.confidence_details.conversion_rate}%</p>
                                                )}
                                                {v.confidence_details.std_error && (
                                                    <p><strong>표준 오차:</strong> {v.confidence_details.std_error}</p>
                                                )}
                                                {v.confidence_details.margin_of_error && (
                                                    <p><strong>오차 한계:</strong> ±{v.confidence_details.margin_of_error}%</p>
                                                )}
                                                <p><strong>공식:</strong> {v.confidence_details.formula}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p>AI 분석 데이터를 불러오는 중...</p>}
                     </div>
                 )}

            </div>
        </div>
    );
};

export default Dashboard;
