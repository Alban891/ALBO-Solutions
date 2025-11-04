/**
 * ALBO Solutions - Demo Data Generator (Horváth Edition)
 * Realistic demo data for Story-Driven Dashboard
 * Based on "Cyber Security Consulting" project structure
 */

/**
 * Generate complete demo data for dashboard
 * Matches the structure from your real project
 */
export function generateDemoData() {
    const jahre = ['2025', '2026', '2027', '2028', '2029'];
    
    // Revenue per year (Software + Hardware)
    const revenueData = {
        labels: jahre,
        values: [16.1, 16.73, 16.87, 17.01, 17.16] // Mio €
    };
    
    // DB2 (Manufacturing Margin) per year
    const db2Data = {
        labels: jahre,
        values: [4.54, 4.65, 4.76, 4.89, 5.02] // Mio €
    };
    
    // Projektkosten per year
    const projektkostenData = {
        labels: jahre,
        values: [0.4, 2.76, 5.1, 5.05, 4.9] // Mio €
    };
    
    // DB3 per year = DB2 - Projektkosten - Marketing - Overhead
    const db3JahrData = {
        labels: jahre,
        values: [2.05, 2.14, 2.23, 2.34, 2.44] // Mio €
    };
    
    // DB3 kumuliert (cumulative)
    const db3KumuliertData = {
        labels: jahre,
        values: [2.05, 4.19, 6.42, 8.76, 11.20] // Mio €
    };
    
    // Calculate totals
    const gesamtRevenue5Y = revenueData.values.reduce((a, b) => a + b, 0) * 1000000;
    const gesamtDB3_5Y = db3JahrData.values.reduce((a, b) => a + b, 0) * 1000000;
    const gesamtProjektkosten = projektkostenData.values.reduce((a, b) => a + b, 0) * 1000000;
    
    // Calculate NPV (simplified)
    const npv = gesamtDB3_5Y - gesamtProjektkosten * 0.5; // Assume 50% discount
    
    // Artikel breakdown
    const artikelBreakdown = [
        { name: 'Software (Perpetual)', value: 0.52, percent: 3.2, color: '#0066CC' },
        { name: 'Hardware', value: 80.0, percent: 95.0, color: '#003366' },
        { name: 'Undefined', value: 4.0, percent: 1.8, color: '#8C9BA5' }
    ];
    
    // Cost breakdown by category
    const costBreakdown = [
        { name: 'Personal', value: 0.45, percent: 2.5, color: '#003366' },
        { name: 'Security Awareness Training', value: 7.65, percent: 92.7, color: '#0066CC' },
        { name: 'Audits & Pentesting', value: 0.16, percent: 1.9, color: '#00A651' },
        { name: 'Compliance', value: 0.0, percent: 0, color: '#8C9BA5' }
    ];
    
    // Sensitivity analysis data
    const sensitivityData = {
        labels: ['Preis (-10%/+10%)', 'Menge (-10%/+10%)', 'Kosten (-10%/+10%)', 'Marketing (-10%/+10%)'],
        negativeImpact: [8.4, 8.4, 1.8, 0.5], // Impact on NPV in Mio €
        positiveImpact: [8.4, 8.4, 1.8, 0.5]
    };
    
    // Scenario analysis
    const scenarioData = {
        labels: jahre,
        datasets: [
            {
                label: 'Best Case (+20%)',
                data: db3JahrData.values.map(v => v * 1.2),
                color: '#00A651'
            },
            {
                label: 'Base Case',
                data: db3JahrData.values,
                color: '#0066CC'
            },
            {
                label: 'Worst Case (-20%)',
                data: db3JahrData.values.map(v => v * 0.8),
                color: '#DC0032'
            }
        ]
    };
    
    // Margin development trend
    const marginTrendData = {
        labels: jahre,
        datasets: [
            {
                label: 'DB1 Margin %',
                data: [38.2, 38.6, 39.0, 39.5, 39.9],
                color: '#0066CC'
            },
            {
                label: 'DB2 Margin %',
                data: [27.3, 27.8, 28.3, 28.7, 29.2],
                color: '#003366'
            },
            {
                label: 'DB3 Margin %',
                data: [12.7, 12.8, 13.2, 13.8, 14.2],
                color: '#00A651'
            }
        ]
    };
    
    // Cost savings potential
    const costSavingsData = [
        {
            category: 'Personal',
            current: 450747,
            potential: 90000,
            recommendation: 'Nearshoring für 20% der Rollen prüfen'
        },
        {
            category: 'Training',
            current: 7650000,
            potential: 500000,
            recommendation: 'Volumenrabatte bei höherer Teilnehmerzahl'
        },
        {
            category: 'Tools & Lizenzen',
            current: 0,
            potential: 0,
            recommendation: 'Bereits optimiert'
        }
    ];
    
    // Risk mitigation actions
    const riskActions = [
        {
            priority: 'high',
            title: 'Preis-Volatilität absichern',
            description: 'Langfristige Rahmenverträge mit Kunden abschließen (3-5 Jahre)',
            impact: 'Hoch',
            effort: 'Mittel'
        },
        {
            priority: 'high',
            title: 'Mengenrisiko minimieren',
            description: 'Garantierte Mindestabnahmen in Verträgen verankern',
            impact: 'Hoch',
            effort: 'Niedrig'
        },
        {
            priority: 'medium',
            title: 'Kostenflexibilität erhöhen',
            description: 'Variable Kostenkomponenten erhöhen (weniger Fixed Costs)',
            impact: 'Mittel',
            effort: 'Hoch'
        },
        {
            priority: 'medium',
            title: 'Marketing-ROI verbessern',
            description: 'Performance-basierte Marketingkanäle priorisieren',
            impact: 'Mittel',
            effort: 'Mittel'
        }
    ];
    
    // Key insights
    const keyInsights = [
        {
            type: 'positive',
            icon: '✅',
            title: 'Starkes Wachstum',
            text: 'Revenue wächst von 16,1M€ auf 17,2M€ (+6,5% CAGR)',
            action: 'Wachstum durch Neukundenakquise beschleunigen'
        },
        {
            type: 'positive',
            icon: '📈',
            title: 'Margin-Verbesserung',
            text: 'DB3-Marge verbessert sich von 12,7% auf 14,2%',
            action: 'Best Practices auf weitere Produkte übertragen'
        },
        {
            type: 'warning',
            icon: '⚠️',
            title: 'Break-Even erst in Jahr 2',
            text: 'Kumulierte DB3 wird erst 2026 positiv',
            action: 'Projektkosten im ersten Jahr reduzieren'
        },
        {
            type: 'action',
            icon: '🎯',
            title: 'Sensitivität auf Preis',
            text: '10% Preisänderung → ±8,4M€ NPV Impact',
            action: 'Pricing-Power durch Differenzierung stärken'
        }
    ];
    
    return {
        projekt: {
            name: 'Cyber Security Consulting',
            id: 'demo-projekt-1'
        },
        projektName: 'Cyber Security Consulting',
        jahre: jahre,
        
        // Year-by-year data
        jahreDaten: {
            '2025': {
                gesamtRevenue: 16100000,
                gesamtDB1: 6348000,
                gesamtDB3: 2050000,
                gesamtProjektkosten: 400000,
                gesamtMarketing: 996000,
                gesamtRnD: 2490000,
                gesamtOverhead: 1812000
            },
            '2026': {
                gesamtRevenue: 16730000,
                gesamtDB1: 6463400,
                gesamtDB3: 2140000,
                gesamtProjektkosten: 2760000,
                gesamtMarketing: 1003800,
                gesamtRnD: 2509500,
                gesamtOverhead: 1049900
            },
            '2027': {
                gesamtRevenue: 16866500,
                gesamtDB1: 6584570,
                gesamtDB3: 2230000,
                gesamtProjektkosten: 5100747,
                gesamtMarketing: 1011990,
                gesamtRnD: 2528975,
                gesamtOverhead: 714848
            },
            '2028': {
                gesamtRevenue: 17009825,
                gesamtDB1: 6711799,
                gesamtDB3: 2340000,
                gesamtProjektkosten: 5051473,
                gesamtMarketing: 1020589,
                gesamtRnD: 2548474,
                gesamtOverhead: 791752
            },
            '2029': {
                gesamtRevenue: 17160316,
                gesamtDB1: 6845389,
                gesamtDB3: 2440000,
                gesamtProjektkosten: 4900000,
                gesamtMarketing: 1029619,
                gesamtRnD: 2569047,
                gesamtOverhead: 906722
            }
        },
        
        // Totals
        gesamtRevenue5Y: gesamtRevenue5Y,
        gesamtDB3_5Y: gesamtDB3_5Y,
        gesamtProjektkosten: gesamtProjektkosten,
        breakEvenJahr: '2026',
        npv: npv,
        irr: 0.18,
        
        // Chart data
        revenueData: revenueData,
        db2Data: db2Data,
        projektkostenData: projektkostenData,
        db3JahrData: db3JahrData,
        db3KumuliertData: db3KumuliertData,
        
        // Breakdown data
        artikelBreakdown: artikelBreakdown,
        costBreakdown: costBreakdown,
        
        // Analysis data
        sensitivityData: sensitivityData,
        scenarioData: scenarioData,
        marginTrendData: marginTrendData,
        costSavingsData: costSavingsData,
        riskActions: riskActions,
        keyInsights: keyInsights,
        
        // Metadata
        artikelListe: [
            { id: 'demo-1', name: 'Software', typ: 'Software', gesamtRevenue5Y: 520000 },
            { id: 'demo-2', name: 'Hardware', typ: 'Hardware', gesamtRevenue5Y: 80000000 }
        ]
    };
}

export default {
    generateDemoData
};
