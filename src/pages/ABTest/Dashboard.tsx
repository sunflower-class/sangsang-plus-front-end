import React, { useState, useEffect, useRef, FC, FormEvent } from 'react';
import Chart from 'chart.js/auto';
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

interface AnalyticsOverview {
  total_tests?: number;
  active_tests?: number;
  total_clicks?: number;
  total_purchases?: number;
  total_cart_additions?: number;
  total_revenue?: number;
  avg_cvr?: number;
  avg_cart_add_rate?: number;
}

interface VariantAnalysis {
  variant_name: string;
  ai_score: number;
  ai_confidence: number;
  cvr: number;
  cart_add_rate: number;
  cart_conversion_rate: number;
  revenue_per_click: number;
  clicks: number;
  confidence_details: any;
}

interface AIAnalysis {
  ai_weights: Record<string, number>;
  variant_analysis: VariantAnalysis[];
}

interface PerformanceResult {
  product_name: string;
  winner: 'baseline' | 'challenger' | 'tie';
  baseline_impressions: number;
  baseline_clicks: number;
  baseline_purchases: number;
  baseline_click_rate: number;
  baseline_conversion_rate: number;
  challenger_impressions: number;
  challenger_clicks: number;
  challenger_purchases: number;
  challenger_click_rate: number;
  challenger_conversion_rate: number;
  improvement_rate: number;
  baseline_cvr?: number;
  challenger_cvr?: number;
  baseline_cart_add_rate?: number;
  challenger_cart_add_rate?: number;
  baseline_cart_cvr?: number;
  challenger_cart_cvr?: number;
}

interface LogEntry {
  timestamp: string;
  message: string;
}

const API_BASE_URL = 'http://localhost:8000/api/abtest';

const Dashboard: FC = () => {
    const [currentTestId, setCurrentTestId] = useState<number | null>(null);
    const [currentTests, setCurrentTests] = useState<Test[]>([]);
    const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview>({});
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [recentResults, setRecentResults] = useState<PerformanceResult[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [view, setView] = useState<'all' | 'create' | 'analysis' | 'history'>('all');

    const chartContainerRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const loadData = () => {
        fetch(`${API_BASE_URL}/list`).then(res => res.json()).then(data => setCurrentTests(data.tests || [])).catch(console.error);
        fetch(`${API_BASE_URL}/analytics/overview`).then(res => res.json()).then(setAnalyticsOverview).catch(console.error);
        fetch(`${API_BASE_URL}/analytics/performance`).then(res => res.json()).then(data => {
            setRecentResults(data.performance || []);
            updatePerformanceChart(data.performance || []);
        }).catch(console.error);
        fetch(`${API_BASE_URL}/logs`).then(res => res.json()).then(data => setLogs(data.logs || [])).catch(console.error);
    };
    
    const updatePerformanceChart = (performanceData: PerformanceResult[]) => {
        const ctx = chartContainerRef.current?.getContext('2d');
        if (!ctx) return;
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar', data: { labels: performanceData.map(item => item.product_name), datasets: [ { label: 'A안 CVR (%)', data: performanceData.map(item => (item.baseline_cvr || 0) * 100), backgroundColor: 'rgba(54, 162, 235, 0.8)' }, { label: 'B안 CVR (%)', data: performanceData.map(item => (item.challenger_cvr || 0) * 100), backgroundColor: 'rgba(255, 99, 132, 0.8)' } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
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
    
    const getStatusClass = (status: Test['status']) => {
        const map = { active: styles.statusActive, completed: styles.statusCompleted, waiting_for_winner_selection: styles.statusWaiting };
        return map[status] || '';
    };

    return (
        <div className={styles.container}>
            <header>
                <h1>🤖 AI 기반 A/B 테스트 자동화 플랫폼</h1>
                <p>실시간 테스트 현황 및 성과 분석</p>
                <div className={styles.navigationButtons}>
                     <button onClick={() => setView('all')} className={`${styles.navBtn} ${view === 'all' ? styles.active : ''}`}>🏠 전체 보기</button>
                     <button onClick={() => setView('create')} className={`${styles.navBtn} ${view === 'create' ? styles.active : ''}`}>🆕 새 테스트</button>
                     <button onClick={() => setView('analysis')} className={`${styles.navBtn} ${view === 'analysis' ? styles.active : ''}`}>🧠 AI 분석</button>
                     <button onClick={() => setView('history')} className={`${styles.navBtn} ${view === 'history' ? styles.active : ''}`}>📈 히스토리</button>
                     <button onClick={() => window.open('/abtest/manage', '_blank')} className={styles.navBtn}>🎮 시뮬레이터</button>
                     <button onClick={loadData} className={styles.navBtn} style={{background: '#667eea', color: 'white'}}>🔄 새로고침</button>
                </div>
            </header>

            <div className={styles.dashboardGrid}>
                {(view === 'all' || view === 'create') && (
                    <div className={styles.card}>
                        <h2>🆕 이미지 기반 A/B 테스트 생성</h2>
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
                        <h2>📊 현재 테스트 현황</h2>
                        <div id="currentTests">
                            {currentTests.length > 0 ? currentTests.map(test => (
                                <div key={test.id} className={styles.testCard}>
                                    <h3>{test.name} <span className={`${styles.testStatus} ${getStatusClass(test.status)}`}>{test.status}</span></h3>
                                    <button onClick={() => setCurrentTestId(test.id)}>분석 보기</button>
                                </div>
                            )) : <p>진행중인 테스트가 없습니다.</p>}
                        </div>
                    </div>
                 )}

                 {(view === 'all' || view === 'analysis') && currentTestId && (
                     <div className={styles.card}>
                        <h2>🧠 AI 분석 결과 (Test ID: {currentTestId})</h2>
                        {aiAnalysis ? (
                            <div>
                                {aiAnalysis.variant_analysis.map(v => (
                                    <div key={v.variant_name} className={styles.aiAnalysisItem}>
                                        <h4>{v.variant_name}</h4>
                                        <p><strong>AI 점수: {v.ai_score.toFixed(3)}</strong></p>
                                        <p>신뢰도: {(v.ai_confidence * 100).toFixed(1)}%</p>
                                        <p>CVR: {(v.cvr * 100).toFixed(2)}%</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p>AI 분석 데이터를 불러오는 중...</p>}
                     </div>
                 )}

                {view === 'all' && (
                     <div className={styles.card}>
                        <h2>📈 핵심 성과 지표</h2>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metric}><span className={styles.metricValue}>{analyticsOverview.total_tests ?? 0}</span><span className={styles.metricLabel}>총 테스트</span></div>
                            <div className={styles.metric}><span className={styles.metricValue}>{analyticsOverview.active_tests ?? 0}</span><span className={styles.metricLabel}>활성 테스트</span></div>
                            <div className={styles.metric}><span className={styles.metricValue}>{analyticsOverview.total_clicks ?? 0}</span><span className={styles.metricLabel}>총 클릭</span></div>
                            <div className={styles.metric}><span className={styles.metricValue}>₩{analyticsOverview.total_revenue?.toLocaleString() ?? 0}</span><span className={styles.metricLabel}>총 매출</span></div>
                        </div>
                    </div>
                )}
                
                {(view === 'all' || view === 'history') && (
                    <div className={`${styles.card} ${styles.fullWidth}`}>
                        <h2>📊 성과 비교 차트</h2>
                        <div className={styles.chartContainer}>
                            <canvas ref={chartContainerRef}></canvas>
                        </div>
                    </div>
                )}

                {(view === 'all' || view === 'history') && (
                     <div className={`${styles.card} ${styles.fullWidth}`}>
                        <h2>🏆 최근 테스트 결과</h2>
                        <div id="recentResults">
                            {recentResults.length > 0 ? recentResults.map(r => (
                                <div key={r.product_name} className={styles.resultItem}>
                                    <h4>{r.product_name} <span className={`${styles.badge} ${r.winner === 'tie' ? styles.tie : styles.winner}`}>{r.winner} 승</span></h4>
                                    <p>전환율 개선: {r.improvement_rate.toFixed(2)}%</p>
                                </div>
                            )) : <p>최근 결과가 없습니다.</p>}
                        </div>
                    </div>
                )}
                
                {(view === 'all' || view === 'history') && (
                    <div className={`${styles.card} ${styles.fullWidth}`}>
                        <h2>📝 실시간 로그</h2>
                        <div className={styles.logsContainer}>
                            {logs.length > 0 ? logs.slice(0, 20).map((log, index) => (
                                <div key={`${log.timestamp}-${index}`} className={styles.logEntry}>
                                    <span className={styles.logTimestamp}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={styles.logMessage}>{log.message}</span>
                                </div>
                            )) : <p>로그가 없습니다.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
