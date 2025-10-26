/**
 * PACKAGE CALCULATION ENGINE
 * Simplified version for initial implementation
 * 
 * IMPORT: import { calculatePackageForecast } from './package-calculation.js';
 */

/**
 * Calculate 5-year forecast for package artikel
 */
export function calculatePackageForecast(packageConfig) {
  console.log('📊 Calculating package forecast...');
  
  const forecast = {
    years: [],
    aggregates: {
      total_revenue_5y: 0,
      arr_year5: 0,
      cagr: 0
    }
  };
  
  // Initialize customer counts per package
  const customersByPackage = packageConfig.packages.map((pkg, index) => {
    const initialCount = Math.round(
      (packageConfig.new_customers_year1 * (packageConfig.mix_distribution[index] || 0)) / 100
    );
    return initialCount;
  });
  
  // Calculate for each year
  for (let year = 1; year <= 5; year++) {
    const yearData = {
      year: 2024 + year,
      by_package: [],
      total_revenue: 0,
      total_arr: 0
    };
    
    // Calculate for each package
    packageConfig.packages.forEach((pkg, pkgIndex) => {
      const currentCustomers = customersByPackage[pkgIndex];
      
      // Calculate revenue
      const setupRevenue = pkg.total_setup * (year === 1 ? currentCustomers : 0);
      const monthlyRevenue = pkg.total_monthly * 12 * currentCustomers;
      const annualRevenue = pkg.total_annual * currentCustomers;
      const totalRevenue = setupRevenue + monthlyRevenue + annualRevenue;
      
      yearData.by_package.push({
        package_id: pkg.id,
        total_customers: currentCustomers,
        new_customers: year === 1 ? currentCustomers : 0,
        setup_revenue: setupRevenue,
        recurring_revenue: monthlyRevenue + annualRevenue,
        total_revenue: totalRevenue
      });
      
      yearData.total_revenue += totalRevenue;
      yearData.total_arr += monthlyRevenue + annualRevenue;
      
      // Apply churn for next year
      if (year < 5) {
        const churnRate = (packageConfig.churn_rates[pkgIndex] || 10) / 100;
        customersByPackage[pkgIndex] = Math.round(currentCustomers * (1 - churnRate));
      }
    });
    
    // Add new customers for next year
    if (year < 5) {
      let newCustomers = packageConfig.new_customers_year1;
      
      if (packageConfig.new_customers_growth === 'linear-10') {
        newCustomers = Math.round(newCustomers * Math.pow(1.1, year));
      } else if (packageConfig.new_customers_growth === 'linear-20') {
        newCustomers = Math.round(newCustomers * Math.pow(1.2, year));
      } else if (packageConfig.new_customers_growth === 'linear-30') {
        newCustomers = Math.round(newCustomers * Math.pow(1.3, year));
      }
      
      packageConfig.packages.forEach((pkg, pkgIndex) => {
        const packageNewCustomers = Math.round(
          (newCustomers * (packageConfig.mix_distribution[pkgIndex] || 0)) / 100
        );
        customersByPackage[pkgIndex] += packageNewCustomers;
      });
    }
    
    forecast.years.push(yearData);
    forecast.aggregates.total_revenue_5y += yearData.total_revenue;
  }
  
  // Calculate ARR Year 5 and CAGR
  forecast.aggregates.arr_year5 = forecast.years[4].total_arr;
  forecast.aggregates.cagr = calculateCAGR(
    forecast.years[0].total_revenue,
    forecast.years[4].total_revenue,
    5
  );
  
  console.log('✅ Forecast calculated:', forecast);
  
  return forecast;
}

function calculateCAGR(startValue, endValue, years) {
  if (startValue === 0) return 0;
  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(1);
}

export default {
  calculatePackageForecast
};