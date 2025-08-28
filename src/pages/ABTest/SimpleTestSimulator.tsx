import React, { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import styles from './SimpleTestSimulator.module.css';

// =================================================================
// 타입 정의 (Type Definitions)
// =================================================================
interface Test {
  id: number;
  name: string;
  status: 'active' | 'completed' | 'waiting_for_winner_selection';
}

interface VersionStats {
  clicks: number;
  purchases: number;
  cart_additions: number;
  cart_purchases: number;
  errors: number;
  page_loads: number;
  total_load_time: number;
  revenue: number;
}

interface Stats {
  versionA: VersionStats;
  versionB: VersionStats;
}

type SimulationSpeed = 'slow' | 'normal' | 'fast' | 'turbo';

const API_BASE_URL = 'http://localhost:8000/api/abtest';

const SimpleTestSimulator: FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [stats, setStats] = useState<Stats>({
        versionA: { clicks: 0, purchases: 0, cart_additions: 0, cart_purchases: 0, errors: 0, page_loads: 0, total_load_time: 0, revenue: 0 },
        versionB: { clicks: 0, purchases: 0, cart_additions: 0, cart_purchases: 0, errors: 0, page_loads: 0, total_load_time: 0, revenue: 0 }
    });
    const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>('fast');
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const speedSettings: Record<SimulationSpeed, number> = {
        slow: 4000, normal: 2000, fast: 800, turbo: 300,
    };
    
    useEffect(() => {
        fetch(`${API_BASE_URL}/list`)
          .then(res => res.json())
          .then(data => setTests(data.tests || []))
          .catch(console.error);
    }, []);

    useEffect(() => {
        if (isRunning && selectedTestId) {
            simulationIntervalRef.current = setInterval(runAutoSimulation, speedSettings[simulationSpeed]);
        }
        return () => {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        };
    }, [isRunning, simulationSpeed, selectedTestId]);

    const recordInteraction = (version: 'A' | 'B', interactionType: string, loadTime?: number) => {
        if (!selectedTestId) {
            console.warn("시뮬레이션을 위해 테스트를 먼저 선택해주세요.");
            return;
        }

        const statsKeyMap: { [key: string]: keyof VersionStats } = {
            'click': 'clicks',
            'purchase': 'purchases',
            'cart_purchase': 'cart_purchases',
            'add_to_cart': 'cart_additions',
            'error': 'errors',
            'page_load': 'page_loads',
        };

        const key = statsKeyMap[interactionType];
        if (key) {
            setStats(prev => {
                const newStats = { ...prev };
                const versionKey = `version${version}` as keyof Stats;
                newStats[versionKey] = { ...newStats[versionKey] };
                
                // 기본 카운터 증가
                newStats[versionKey][key] = newStats[versionKey][key] + 1;
                
                // 특별한 처리
                if (interactionType === 'page_load' && loadTime) {
                    newStats[versionKey].total_load_time += loadTime;
                }
                
                // 매출 계산 (구매 시 1,200,000원)
                if (interactionType === 'purchase' || interactionType === 'cart_purchase') {
                    newStats[versionKey].revenue += 1200000;
                }
                
                return newStats;
            });
        }

        fetch(`${API_BASE_URL}/interaction`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test_id: parseInt(selectedTestId), variant: version === 'A' ? 'baseline' : 'challenger', interaction_type: interactionType }) }).catch(err => console.error("API Error:", err));
    };

    const runAutoSimulation = () => {
        const version = Math.random() < 0.5 ? 'A' : 'B';
        const loadTime = 500 + Math.random() * 2000; // 500ms ~ 2.5초
        
        // 페이지 로드 (100%)
        setTimeout(() => recordInteraction(version, 'page_load', loadTime), Math.random() * 50);
        
        // 클릭 (70%)
        if (Math.random() < 0.7) {
            setTimeout(() => recordInteraction(version, 'click'), 100 + Math.random() * 100);
            
            // 장바구니 추가 (30%)
            if (Math.random() < 0.3) {
                setTimeout(() => recordInteraction(version, 'add_to_cart'), 300 + Math.random() * 200);
                
                // 장바구니에서 구매 (40%)
                if (Math.random() < 0.4) {
                    setTimeout(() => recordInteraction(version, 'cart_purchase'), 500 + Math.random() * 300);
                }
            } 
            // 직접 구매 (15%)
            else if (Math.random() < 0.15) {
                setTimeout(() => recordInteraction(version, 'purchase'), 400 + Math.random() * 200);
            }
        }
        
        // 오류 (2%)
        if (Math.random() < 0.02) {
            setTimeout(() => recordInteraction(version, 'error'), Math.random() * 800);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setStats({
            versionA: { clicks: 0, purchases: 0, cart_additions: 0, cart_purchases: 0, errors: 0, page_loads: 0, total_load_time: 0, revenue: 0 },
            versionB: { clicks: 0, purchases: 0, cart_additions: 0, cart_purchases: 0, errors: 0, page_loads: 0, total_load_time: 0, revenue: 0 }
        });
    };
    
    const { versionA, versionB } = stats;
    
    // 핵심 지표 계산
    const cvrA = versionA.clicks > 0 ? ((versionA.purchases / versionA.clicks) * 100) : 0;
    const cvrB = versionB.clicks > 0 ? ((versionB.purchases / versionB.clicks) * 100) : 0;
    
    // 보조 지표 계산
    const cartRateA = versionA.clicks > 0 ? ((versionA.cart_additions / versionA.clicks) * 100) : 0;
    const cartRateB = versionB.clicks > 0 ? ((versionB.cart_additions / versionB.clicks) * 100) : 0;
    const cartCvrA = versionA.cart_additions > 0 ? ((versionA.cart_purchases / versionA.cart_additions) * 100) : 0;
    const cartCvrB = versionB.cart_additions > 0 ? ((versionB.cart_purchases / versionB.cart_additions) * 100) : 0;
    
    // 가드레일 지표 계산
    const errorRateA = versionA.clicks > 0 ? ((versionA.errors / versionA.clicks) * 100) : 0;
    const errorRateB = versionB.clicks > 0 ? ((versionB.errors / versionB.clicks) * 100) : 0;
    const avgLoadTimeA = versionA.page_loads > 0 ? (versionA.total_load_time / versionA.page_loads) : 0;
    const avgLoadTimeB = versionB.page_loads > 0 ? (versionB.total_load_time / versionB.page_loads) : 0;

    return (
        <div className={styles.container}>
            <h1>A/B 테스트 시뮬레이터</h1>
            <div className={styles.controls}>
                <select value={selectedTestId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTestId(e.target.value)}>
                    <option value="">테스트를 선택하세요...</option>
                    {tests.map(test => (
                        <option key={test.id} value={test.id} disabled={test.status === 'completed'}>
                            {test.name} ({test.status})
                        </option>
                    ))}
                </select>
                <select value={simulationSpeed} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSimulationSpeed(e.target.value as SimulationSpeed)}>
                    <option value="slow">느림</option>
                    <option value="normal">보통</option>
                    <option value="fast">빠름</option>
                    <option value="turbo">터보</option>
                </select>
                <button onClick={() => setIsRunning(!isRunning)} className={`${styles.controlBtn} ${isRunning ? styles.btnReset : styles.btnStart}`}>
                    {isRunning ? '시뮬레이션 중지' : '시뮬레이션 시작'}
                </button>
                <button onClick={handleReset} className={`${styles.controlBtn} ${styles.btnReset}`}>초기화</button>
                <button onClick={() => window.location.href = '/abtest'} className={`${styles.controlBtn} ${styles.btnDashboard}`}>대시보드로 이동</button>
            </div>
            
            <div className={styles.simulatorGrid}>
                {(['A', 'B'] as const).map(v => (
                    <div className={styles.versionCard} key={v}>
                        <h2>버전 {v} {v === 'A' ? '(현재)' : '(AI 생성)'}</h2>
                        <div className={styles.productImage}>📱</div>
                        <div className={styles.productTitle}>스마트폰 Pro Max</div>
                        <div className={styles.productPrice}>₩1,200,000</div>
                        <div className={styles.actionButtons}>
                            <button className={`${styles.btn} ${styles.btnView}`} onClick={() => recordInteraction(v, 'page_load')}>로드</button>
                            <button className={`${styles.btn} ${styles.btnView}`} onClick={() => recordInteraction(v, 'click')}>클릭</button>
                            <button className={`${styles.btn} ${styles.btnView}`} style={{background: '#ed8936'}} onClick={() => recordInteraction(v, 'add_to_cart')}>장바구니</button>
                            <button className={`${styles.btn} ${styles.btnBuy}`} onClick={() => recordInteraction(v, 'purchase')}>구매하기</button>
                            <button className={`${styles.btn}`} style={{background: '#e53e3e'}} onClick={() => recordInteraction(v, 'error')}>오류</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.statsPanel}>
                <h3>실시간 통계</h3>
                <p className={styles.flowDescription}>새로운 플로우: 클릭 → 장바구니 추가 → 구매하기 | 가드레일: 오류, 로드시간</p>
                
                {/* 핵심 지표 */}
                <div className={styles.statsSection}>
                    <h4>핵심 지표 (Core Metrics)</h4>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.clicks}</span><span className={styles.statLabel}>버전 A 클릭</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.purchases}</span><span className={styles.statLabel}>버전 A 구매</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cvrA.toFixed(2)}%</span><span className={styles.statLabel}>버전 A CVR</span></div>
                    </div>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.clicks}</span><span className={styles.statLabel}>버전 B 클릭</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.purchases}</span><span className={styles.statLabel}>버전 B 구매</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cvrB.toFixed(2)}%</span><span className={styles.statLabel}>버전 B CVR</span></div>
                    </div>
                </div>

                {/* 보조 지표 */}
                <div className={styles.statsSection}>
                    <h4>보조 지표 (Auxiliary Metrics)</h4>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.cart_additions}</span><span className={styles.statLabel}>버전 A 장바구니</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cartRateA.toFixed(2)}%</span><span className={styles.statLabel}>버전 A 장바구니율</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cartCvrA.toFixed(2)}%</span><span className={styles.statLabel}>버전 A 장바구니 CVR</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>₩{versionA.revenue.toLocaleString()}</span><span className={styles.statLabel}>버전 A 매출</span></div>
                    </div>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.cart_additions}</span><span className={styles.statLabel}>버전 B 장바구니</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cartRateB.toFixed(2)}%</span><span className={styles.statLabel}>버전 B 장바구니율</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{cartCvrB.toFixed(2)}%</span><span className={styles.statLabel}>버전 B 장바구니 CVR</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>₩{versionB.revenue.toLocaleString()}</span><span className={styles.statLabel}>버전 B 매출</span></div>
                    </div>
                </div>

                {/* 가드레일 지표 */}
                <div className={styles.statsSection}>
                    <h4>가드레일 지표 (Guardrail Metrics)</h4>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.errors}</span><span className={styles.statLabel}>버전 A 오류</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{errorRateA.toFixed(2)}%</span><span className={styles.statLabel}>버전 A 오류율</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{avgLoadTimeA.toFixed(0)}ms</span><span className={styles.statLabel}>버전 A 로드시간</span></div>
                    </div>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.errors}</span><span className={styles.statLabel}>버전 B 오류</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{errorRateB.toFixed(2)}%</span><span className={styles.statLabel}>버전 B 오류율</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{avgLoadTimeB.toFixed(0)}ms</span><span className={styles.statLabel}>버전 B 로드시간</span></div>
                    </div>
                </div>

                {/* 자동 시뮬레이션 확률 설정 */}
                <div className={styles.statsSection}>
                    <h4>자동 시뮬레이션 확률 설정 (Automatic Simulation Probability Settings)</h4>
                    <div className={styles.probabilityGrid}>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>페이지 로드</span>
                            <span className={styles.probabilityValue}>100%</span>
                            <span className={styles.probabilityDesc}>(모든 방문자)</span>
                        </div>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>클릭</span>
                            <span className={styles.probabilityValue}>70%</span>
                            <span className={styles.probabilityDesc}>(페이지 로드 후)</span>
                        </div>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>장바구니 추가</span>
                            <span className={styles.probabilityValue}>30%</span>
                            <span className={styles.probabilityDesc}>(클릭 후)</span>
                        </div>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>장바구니 구매</span>
                            <span className={styles.probabilityValue}>40%</span>
                            <span className={styles.probabilityDesc}>(장바구니 추가 후)</span>
                        </div>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>직접 구매</span>
                            <span className={styles.probabilityValue}>15%</span>
                            <span className={styles.probabilityDesc}>(클릭 후)</span>
                        </div>
                        <div className={styles.probabilityItem}>
                            <span className={styles.probabilityLabel}>오류</span>
                            <span className={styles.probabilityValue}>2%</span>
                            <span className={styles.probabilityDesc}>(랜덤)</span>
                        </div>
                    </div>
                    <div className={styles.flowDescription}>
                        <strong>실제 방문자 플로우 시뮬레이션:</strong> 페이지 로드 → 클릭(70%) → [장바구니 추가(30%) → 장바구니 구매(40%)] 또는 [직접 구매(15%)] + 오류(2%)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleTestSimulator;
