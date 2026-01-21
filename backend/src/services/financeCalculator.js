// Financial calculation utilities

class FinanceCalculator {
  /**
   * Calculate EMI (Equated Monthly Installment)
   * P × r × (1 + r)^n / ((1 + r)^n - 1)
   */
  calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / (12 * 100);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return {
      emi: Math.round(emi * 100) / 100,
      totalAmount: Math.round(emi * tenureMonths * 100) / 100,
      totalInterest: Math.round((emi * tenureMonths - principal) * 100) / 100
    };
  }
  
  /**
   * Calculate SIP (Systematic Investment Plan) maturity amount
   * P × [((1 + r)^n - 1) / r] × (1 + r)
   */
  calculateSIP(monthlyAmount, annualRate, years) {
    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    
    const maturityAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const investedAmount = monthlyAmount * months;
    
    return {
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      investedAmount: investedAmount,
      returns: Math.round((maturityAmount - investedAmount) * 100) / 100
    };
  }
  
  /**
   * Calculate compound interest
   * A = P (1 + r/n)^(nt)
   */
  calculateCompoundInterest(principal, annualRate, years, compoundsPerYear = 1) {
    const amount = principal * Math.pow(1 + annualRate / (100 * compoundsPerYear), compoundsPerYear * years);
    
    return {
      amount: Math.round(amount * 100) / 100,
      interest: Math.round((amount - principal) * 100) / 100
    };
  }
  
  /**
   * Calculate time to reach goal
   * Returns months needed based on current savings and monthly contribution
   */
  calculateTimeToGoal(currentAmount, monthlyContribution, targetAmount, annualRate) {
    const monthlyRate = annualRate / (12 * 100);
    
    if (monthlyContribution === 0 && currentAmount >= targetAmount) return 0;
    if (monthlyContribution === 0) return Infinity;
    
    // Simplified calculation
    if (currentAmount === 0) {
      const months = targetAmount / monthlyContribution;
      return Math.ceil(months);
    }
    
    // Approximate calculation with rate
    let months = 0;
    let balance = currentAmount;
    
    while (balance < targetAmount && months < 600) { // Max 50 years
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;
    }
    
    return months;
  }
  
  /**
   * Calculate budget utilization
   */
  calculateBudgetUtilization(budget, expenses) {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const utilizationPercentage = (totalSpent / budget) * 100;
    
    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      remaining: Math.round((budget - totalSpent) * 100) / 100,
      percentage: Math.round(utilizationPercentage * 100) / 100
    };
  }
}

module.exports = new FinanceCalculator();

