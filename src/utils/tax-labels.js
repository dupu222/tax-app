export function displayIncomeType(type) {
  if (type === '工资薪金所得') {
    return '工资薪金';
  }
  return type || '';
}

export function displayIncomeCategory(category) {
  if (category === '全年一次性奖金') {
    return '全年一次性奖金收入';
  }
  return category || '';
}
