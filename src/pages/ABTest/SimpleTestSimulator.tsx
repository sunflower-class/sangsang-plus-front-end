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
  errors: number;
  page_loads: number;
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
        versionA: { clicks: 0, purchases: 0, cart_additions: 0, errors: 0, page_loads: 0 },
        versionB: { clicks: 0, purchases: 0, cart_additions: 0, errors: 0, page_loads: 0 }
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

    const recordInteraction = (version: 'A' | 'B', interactionType: string) => {
        if (!selectedTestId) {
            console.warn("시뮬레이션을 위해 테스트를 먼저 선택해주세요.");
            return;
        }

        const statsKeyMap: { [key: string]: keyof VersionStats } = {
            'click': 'clicks',
            'purchase': 'purchases',
            'add_to_cart': 'cart_additions',
            'error': 'errors',
            'page_load': 'page_loads',
        };

        const key = statsKeyMap[interactionType];
        if (key) {
            setStats(prev => ({ ...prev, [`version${version}`]: { ...prev[`version${version}`], [key]: prev[`version${version}`][key] + 1 } }));
        }

        fetch(`${API_BASE_URL}/interaction`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test_id: parseInt(selectedTestId), variant: version === 'A' ? 'baseline' : 'challenger', interaction_type: interactionType }) }).catch(err => console.error("API Error:", err));
    };

    const runAutoSimulation = () => {
        const version = Math.random() < 0.5 ? 'A' : 'B';
        setTimeout(() => recordInteraction(version, 'page_load'), Math.random() * 50);
        if (Math.random() < 0.7) {
            setTimeout(() => recordInteraction(version, 'click'), 100 + Math.random() * 100);
            if (Math.random() < 0.3) {
                 setTimeout(() => recordInteraction(version, 'add_to_cart'), 300 + Math.random() * 200);
                 if (Math.random() < 0.4) {
                     setTimeout(() => recordInteraction(version, 'purchase'), 500 + Math.random() * 300);
                 }
            } else if (Math.random() < 0.15) {
                 setTimeout(() => recordInteraction(version, 'purchase'), 400 + Math.random() * 200);
            }
        }
        if (Math.random() < 0.02) setTimeout(() => recordInteraction(version, 'error'), Math.random() * 800);
    };

    const handleReset = () => {
        setIsRunning(false);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setStats({
            versionA: { clicks: 0, purchases: 0, cart_additions: 0, errors: 0, page_loads: 0 },
            versionB: { clicks: 0, purchases: 0, cart_additions: 0, errors: 0, page_loads: 0 }
        });
    };
    
    const { versionA, versionB } = stats;
    const cvrA = versionA.clicks > 0 ? ((versionA.purchases / versionA.clicks) * 100) : 0;
    const cvrB = versionB.clicks > 0 ? ((versionB.purchases / versionB.clicks) * 100) : 0;

    return (
        <div className={styles.container}>
            <h1>🧪 A/B 테스트 시뮬레이터</h1>
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
                    <option value="slow">🐌 느림</option>
                    <option value="normal">🚶 보통</option>
                    <option value="fast">🏃 빠름</option>
                    <option value="turbo">🚀 터보</option>
                </select>
                <button onClick={() => setIsRunning(!isRunning)} className={`${styles.controlBtn} ${isRunning ? styles.btnReset : styles.btnStart}`}>
                    {isRunning ? '⏹️ 시뮬레이션 중지' : '🚀 시뮬레이션 시작'}
                </button>
                <button onClick={handleReset} className={`${styles.controlBtn} ${styles.btnReset}`}>🔄 초기화</button>
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
                <h3>📊 실시간 통계</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.clicks}</span><span className={styles.statLabel}>A 클릭</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.clicks}</span><span className={styles.statLabel}>B 클릭</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.cart_additions}</span><span className={styles.statLabel}>A 장바구니</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.cart_additions}</span><span className={styles.statLabel}>B 장바구니</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.purchases}</span><span className={styles.statLabel}>A 구매</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.purchases}</span><span className={styles.statLabel}>B 구매</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{cvrA.toFixed(2)}%</span><span className={styles.statLabel}>A CVR</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{cvrB.toFixed(2)}%</span><span className={styles.statLabel}>B CVR</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionA.errors}</span><span className={styles.statLabel}>A 오류</span></div>
                    <div className={styles.statItem}><span className={styles.statValue}>{stats.versionB.errors}</span><span className={styles.statLabel}>B 오류</span></div>
                </div>
            </div>
        </div>
    );
};

export default SimpleTestSimulator;
